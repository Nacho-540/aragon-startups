import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartupsTable } from '@/components/admin/startups-table'
import { Building2, CheckCircle2, XCircle, Calendar, Users as UsersIcon, TrendingUp, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExportButton } from '@/components/admin/export-button'

async function getStartupsData() {
  const supabase = await createClient()

  // Verify admin access
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

  // Get all startups
  const { data: startups, error: startupsError } = await supabase
    .from('startups')
    .select('*')
    .order('created_at', { ascending: false })

  if (startupsError) {
    console.error('Error fetching startups:', startupsError)
    return {
      startups: [],
      stats: {
        total: 0,
        approved: 0,
        pending: 0,
        active: 0,
        thisMonth: 0,
        avgEmployees: 0,
      },
    }
  }

  // Calculate statistics
  const total = startups?.length || 0
  const approved = startups?.filter((s) => s.is_approved).length || 0
  const pending = total - approved
  const active = startups?.filter((s) => s.estado === 'active').length || 0

  // Startups created this month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth =
    startups?.filter((s) => new Date(s.created_at) >= firstDayOfMonth).length || 0

  // Average founding year (for insights)
  const foundingYears = startups
    ?.map((s) => s.año_fundacion)
    .filter((year): year is number => year !== null)
  const avgFoundingYear =
    foundingYears && foundingYears.length > 0
      ? Math.round(foundingYears.reduce((a, b) => a + b, 0) / foundingYears.length)
      : 0

  return {
    startups: startups || [],
    stats: {
      total,
      approved,
      pending,
      active,
      thisMonth,
      avgFoundingYear,
    },
  }
}

export default async function AdminStartupsPage() {
  const { startups, stats } = await getStartupsData()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Startups</h1>
          <p className="text-muted-foreground mt-2">
            Administra y supervisa todas las startups del directorio
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButton />
          <Link href="/admin/startups/new">
            <Button>Añadir Startup</Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Startups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En el directorio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-amber-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sin aprobar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estado operativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nuevas startups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-gray-600" />
              Año Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.avgFoundingYear || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Año de fundación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Startups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Startups</CardTitle>
          <CardDescription>
            Todas las startups registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StartupsTable startups={startups} />
        </CardContent>
      </Card>
    </div>
  )
}
