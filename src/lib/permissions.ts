import type { User, UserPermissions, UserRole } from '@/types'

export function hasPermission(_user: User | null, _module: keyof UserPermissions): boolean {
  return true
}

export function canManageUsers(_user: User | null): boolean {
  return true
}

export function canEditRoutes(_user: User | null): boolean {
  return true
}

export function canEditFinancial(_user: User | null): boolean {
  return true
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'Desenvolvedor',
    admin: 'Administrador',
    driver: 'Motorista',
    viewer: 'Visualizador',
  }
  return labels[role]
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'bg-primary/20 text-primary',
    admin: 'bg-info/20 text-info',
    driver: 'bg-warning/20 text-warning',
    viewer: 'bg-muted/20 text-muted-foreground',
  }
  return colors[role]
}
