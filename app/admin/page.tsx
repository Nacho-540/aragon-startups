import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Building2, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getAdminStats() {
  const supabase = await createClient()
  const supabaseAdmin = createServiceClient()

  // Get pending submissions count
  const { count: pendingSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get total startups count
  const { count: totalStartups } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })

  // Get total users count using service role client
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  const totalUsers = usersData?.users?.length || 0

  // Get recent pending submissions (last 5)
  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    pendingSubmissions: pendingSubmissions || 0,
    totalStartups: totalStartups || 0,
    totalUsers,
    recentSubmissions: recentSubmissions || [],
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="text-gray-600 mt-2">
          Resumen de la plataforma y acciones pendientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitudes Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-gray-600 mt-1">
              Requieren revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Startups
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStartups}</div>
            <p className="text-xs text-gray-600 mt-1">
              Publicadas en el directorio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Registrados
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total en la plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Aprobación
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-gray-600 mt-1">
              En desarrollo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/submissions">
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Revisar Solicitudes Pendientes ({stats.pendingSubmissions})
              </Button>
            </Link>
            <Link href="/admin/startups/new">
              <Button className="w-full" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Añadir Startup Manualmente
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Solicitudes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay solicitudes pendientes
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentSubmissions.map((submission: any) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {submission.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Link href={`/admin/submissions/${submission.id}`}>
                      <Button size="sm" variant="ghost">
                        Revisar
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Versión</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Última actualización</p>
              <p className="font-medium">{new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado</p>
              <p className="font-medium text-green-600">Operativo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
