import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Transaction, FinancialCategory } from '@/types'
import { getMonthDateRange } from '@/lib/formatters'
import { useEffect } from 'react'

export function useTransactions(month: number, year: number) {
  const { company } = useAuth()
  const queryClient = useQueryClient()
  const { startDate, endDate } = getMonthDateRange(month, year)

  const query = useQuery({
    queryKey: ['transactions', company?.id, month, year],
    queryFn: async (): Promise<Transaction[]> => {
      if (!company) return []
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:financial_categories(*)')
        .eq('company_id', company.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!company,
  })

  // Realtime subscription
  useEffect(() => {
    if (!company) return

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `company_id=eq.${company.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [company?.id, queryClient])

  return query
}

export function useTodayTransactions() {
  const { company } = useAuth()
  const today = new Date().toISOString().split('T')[0]

  return useQuery({
    queryKey: ['transactions-today', company?.id, today],
    queryFn: async (): Promise<Transaction[]> => {
      if (!company) return []
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:financial_categories(*)')
        .eq('company_id', company.id)
        .eq('date', today)

      if (error) throw error
      return data ?? []
    },
    enabled: !!company,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { company, user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      type: 'entrada' | 'saida'
      amount: number
      description?: string
      category_id?: string
      date: string
    }) => {
      if (!company || !user) throw new Error('Not authenticated')

      const { error } = await supabase.from('transactions').insert({
        ...data,
        company_id: company.id,
        created_by: user.id,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions-today'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions-today'] })
    },
  })
}

// Categories
export function useCategories() {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['categories', company?.id],
    queryFn: async (): Promise<FinancialCategory[]> => {
      if (!company) return []
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('company_id', company.id)
        .order('type')
        .order('name')

      if (error) throw error
      return data ?? []
    },
    enabled: !!company,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { company } = useAuth()

  return useMutation({
    mutationFn: async (data: { name: string; type: 'entrada' | 'saida'; color: string }) => {
      if (!company) throw new Error('No company')
      const { error } = await supabase.from('financial_categories').insert({
        ...data,
        company_id: company.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; type: 'entrada' | 'saida'; color: string }) => {
      const { error } = await supabase.from('financial_categories').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
