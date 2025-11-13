import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EditForm } from '@/components/startups/edit-form'
import { AlertCircle, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Startup } from '@/types/startup'

async function getOwnedStartup() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if user owns any startup (approved ownership)
  const { data: ownership, error: ownershipError } = await supabase
    .from('startup_owners')
    .select('startup_id, approved')
    .eq('user_id', user.id)
    .eq('approved', true)
    .maybeSingle()

  if (ownershipError) {
    console.error('Error checking ownership:', ownershipError)
    return { startup: null, error: 'Error al verificar la propiedad' }
  }

  if (!ownership) {
    return { startup: null, error: null }
  }

  // Get startup details
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('*')
    .eq('id', ownership.startup_id)
    .single()

  if (startupError) {
    console.error('Error fetching startup:', startupError)
    return { startup: null, error: 'Error al cargar la startup' }
  }

  return { startup: startup as Startup, error: null }
}

export default async function MyStartupPage() {
  const { startup, error } = await getOwnedStartup()

  // If there's an error, show error message
  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Startup</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la información de tu startup
          </p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user doesn't own a startup, show message
  if (!startup) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Startup</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la información de tu startup
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes una startup reclamada
              </h3>
              <p className="text-gray-600 mb-6">
                Para editar la información de una startup, primero debes reclamarla y esperar la aprobación del administrador.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="default">
                  <Link href="/startups">
                    Explorar Startups
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    Volver al Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User owns a startup, show edit form
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Startup</h1>
        <p className="text-gray-600 mt-2">
          Edita la información de <strong>{startup.nombre}</strong>
        </p>
      </div>

      {/* Startup Info Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {startup.nombre}
          </CardTitle>
          <CardDescription>
            Propietario verificado • Última actualización: {new Date(startup.updated_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className={`ml-2 font-medium ${
                startup.is_approved
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}>
                {startup.is_approved ? 'Publicado' : 'Pendiente de aprobación'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Ubicación:</span>
              <span className="ml-2 font-medium text-gray-900">{startup.ubicacion}</span>
            </div>
            {startup.año_fundacion && (
              <div>
                <span className="text-gray-600">Fundada:</span>
                <span className="ml-2 font-medium text-gray-900">{startup.año_fundacion}</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/startups/${startup.slug}`} target="_blank">
                Ver perfil público →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <EditForm startup={startup} />
    </div>
  )
}
