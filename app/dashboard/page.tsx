import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userRole = user?.user_metadata?.role || 'entrepreneur'
  const fullName = user?.user_metadata?.full_name || 'Usuario'

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
            <p className="text-3xl font-bold">0</p>
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
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">
                Startups con información de contacto
              </p>
            </CardContent>
          </Card>
        )}

        {userRole === 'entrepreneur' && (
          <Card>
            <CardHeader>
              <CardTitle>Mi Startup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reclama o añade tu startup al directorio
              </p>
            </CardContent>
          </Card>
        )}

        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Pendientes de revisión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
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
