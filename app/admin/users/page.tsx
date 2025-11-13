import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserTable } from '@/components/admin/user-table'
import { Users } from 'lucide-react'

async function getAllUsers() {
  const supabase = await createClient()

  // Get current user to verify admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Use service client for admin operations
  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], currentUserId: user.id }
  }

  // Transform user data for display
  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email || '',
    full_name: u.user_metadata?.full_name || 'Sin nombre',
    role: u.user_metadata?.role || 'entrepreneur',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    email_confirmed_at: u.email_confirmed_at ?? null,
  }))

  // Sort by creation date (newest first)
  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { users, currentUserId: user.id }
}

export default async function AdminUsersPage() {
  const { users, currentUserId } = await getAllUsers()

  // Statistics
  const totalUsers = users.length
  const entrepreneurs = users.filter((u) => u.role === 'entrepreneur').length
  const investors = users.filter((u) => u.role === 'investor').length
  const admins = users.filter((u) => u.role === 'admin').length
  const confirmedEmails = users.filter((u) => u.email_confirmed_at).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-2">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emprendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{entrepreneurs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inversores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{investors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emails Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{confirmedEmails}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((confirmedEmails / totalUsers) * 100)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={users} currentUserId={currentUserId} />
        </CardContent>
      </Card>
    </div>
  )
}
