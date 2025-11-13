import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Edit, CheckCircle2, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userRole = user?.user_metadata?.role || 'entrepreneur'
  const fullName = user?.user_metadata?.full_name || 'Usuario'

  // Get total startups count
  const { count: totalStartups } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)

  // Get pending submissions count (for admins)
  const { count: pendingSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get startups with contact info count (for investors)
  const { count: startupsWithContact } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)
    .not('email', 'is', null)

  // Check if entrepreneur owns a startup
  let ownedStartup: any = null
  let claimStatus = null
  if (userRole === 'entrepreneur' && user) {
    const { data: ownership } = await supabase
      .from('startup_owners')
      .select(`
        id,
        approved,
        startups (
          id,
          nombre,
          slug,
          ubicacion
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle()

    if (ownership?.startups) {
      // Supabase returns an array, but we know it's a single startup
      ownedStartup = Array.isArray(ownership.startups) ? ownership.startups[0] : ownership.startups
      claimStatus = ownership.approved ? 'approved' : 'pending'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bienvenido, {fullName}</h1>
        <p className="text-muted-foreground mt-2">
          Este es tu panel de control del ecosistema de startups de Aragón
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Startups en Aragón</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStartups || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Startups registradas
            </p>
          </CardContent>
        </Card>

        {userRole === 'investor' && (
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{startupsWithContact || 0}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Startups con información de contacto
              </p>
            </CardContent>
          </Card>
        )}

        {userRole === 'entrepreneur' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Mi Startup
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ownedStartup ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{ownedStartup.nombre}</p>
                    <p className="text-sm text-muted-foreground">{ownedStartup.ubicacion}</p>
                  </div>
                  {claimStatus === 'approved' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Verificado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Pendiente de aprobación</span>
                    </div>
                  )}
                  {claimStatus === 'approved' && (
                    <Button asChild size="sm" className="w-full">
                      <Link href="/dashboard/my-startup">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar mi startup
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Reclama o añade tu startup al directorio
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/startups">Explorar startups</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Pendientes de revisión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingSubmissions || 0}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Envíos esperando aprobación
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Acciones rápidas</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-2">Explorar startups</h3>
              <p className="text-sm text-muted-foreground">
                Navega por el directorio completo de startups de Aragón
              </p>
            </CardContent>
          </Card>

          {userRole === 'entrepreneur' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Registrar mi startup</h3>
                <p className="text-sm text-muted-foreground">
                  Añade tu startup al directorio y gana visibilidad
                </p>
              </CardContent>
            </Card>
          )}

          {userRole === 'investor' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Buscar oportunidades</h3>
                <p className="text-sm text-muted-foreground">
                  Encuentra startups que se ajusten a tu perfil de inversión
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
