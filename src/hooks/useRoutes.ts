import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Route, Customer, RouteAttachment } from '@/types'

export function useRoutes(filters?: { status?: string; date?: string }) {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['routes', company?.id, filters],
    queryFn: async (): Promise<Route[]> => {
      if (!company) return []
      let query = supabase
        .from('routes')
        .select('*, customer:customers(*), driver:users!routes_driver_id_fkey(*)')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.date) {
        query = query.eq('delivery_date', filters.date)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    enabled: !!company,
  })
}

export function useRoute(id: string) {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['route', id],
    queryFn: async (): Promise<Route | null> => {
      if (!company) return null
      const { data, error } = await supabase
        .from('routes')
        .select('*, customer:customers(*), driver:users!routes_driver_id_fkey(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!company && !!id,
  })
}

export function usePublicRoute(token: string) {
  return useQuery({
    queryKey: ['public-route', token],
    queryFn: async (): Promise<{ route: Route; company: { name: string; logo_url: string | null }; attachments: RouteAttachment[] } | null> => {
      const { data: route, error } = await supabase
        .from('routes')
        .select('*, customer:customers(*)')
        .eq('public_token', token)
        .eq('public_link_active', true)
        .single()

      if (error || !route) return null

      const { data: company } = await supabase
        .from('companies')
        .select('name, logo_url')
        .eq('id', route.company_id)
        .single()

      const { data: attachments } = await supabase
        .from('route_attachments')
        .select('*')
        .eq('route_id', route.id)
        .order('created_at', { ascending: false })

      return {
        route,
        company: company ?? { name: 'Empresa', logo_url: null },
        attachments: attachments ?? [],
      }
    },
    enabled: !!token,
  })
}

export function useCreateRoute() {
  const queryClient = useQueryClient()
  const { company } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      title: string
      customer_id?: string
      driver_id?: string
      delivery_date?: string
      address_destination?: string
      notes?: string
      amount?: number
    }) => {
      if (!company) throw new Error('No company')
      const { data: route, error } = await supabase
        .from('routes')
        .insert({ ...data, company_id: company.id })
        .select()
        .single()

      if (error) throw error
      return route
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    },
  })
}

export function useUpdateRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      title?: string
      customer_id?: string | null
      driver_id?: string | null
      status?: string
      delivery_date?: string | null
      address_destination?: string | null
      notes?: string | null
      amount?: number | null
      public_link_active?: boolean
      payment_confirmed?: boolean
      payment_confirmed_at?: string | null
    }) => {
      const { error } = await supabase.from('routes').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
      queryClient.invalidateQueries({ queryKey: ['route', variables.id] })
    },
  })
}

export function useDeleteRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    },
  })
}

// Customers
export function useCustomers() {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['customers', company?.id],
    queryFn: async (): Promise<Customer[]> => {
      if (!company) return []
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', company.id)
        .order('name')

      if (error) throw error
      return data ?? []
    },
    enabled: !!company,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const { company } = useAuth()

  return useMutation({
    mutationFn: async (data: { name: string; phone?: string; email?: string; address?: string }) => {
      if (!company) throw new Error('No company')
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({ ...data, company_id: company.id })
        .select()
        .single()

      if (error) throw error
      return customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

// Attachments
export function useRouteAttachments(routeId: string) {
  return useQuery({
    queryKey: ['route-attachments', routeId],
    queryFn: async (): Promise<RouteAttachment[]> => {
      const { data, error } = await supabase
        .from('route_attachments')
        .select('*')
        .eq('route_id', routeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!routeId,
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ routeId, file }: { routeId: string; file: File }) => {
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${routeId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('route-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('route-attachments')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('route_attachments').insert({
        route_id: routeId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        uploaded_by: user.id,
      })

      if (dbError) throw dbError
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['route-attachments', variables.routeId] })
    },
  })
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, routeId }: { id: string; routeId: string }) => {
      const { error } = await supabase.from('route_attachments').delete().eq('id', id)
      if (error) throw error
      return routeId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['route-attachments', variables.routeId] })
    },
  })
}

// Drivers
export function useDrivers() {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['drivers', company?.id],
    queryFn: async () => {
      if (!company) return []
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', company.id)
        .in('role', ['driver', 'admin', 'owner'])
        .order('name')

      if (error) throw error
      return data ?? []
    },
    enabled: !!company,
  })
}
