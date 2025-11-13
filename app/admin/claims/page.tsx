import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, XCircle, Building2, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ClaimWithDetails {
  id: string
  user_id: string
  startup_id: string
  approved: boolean
  created_at: string
  users: {
    email: string
    raw_user_meta_data: {
      full_name?: string
    }
  }
  startups: {
    id: string
    nombre: string
    slug: string
    ubicacion: string
    logo_url?: string
  }
}

async function getClaims() {
  const supabase = await createClient()

  // Get all ownership claims with user and startup details
  const { data: claims, error } = await supabase
    .from('startup_owners')
    .select(`
      id,
      user_id,
      startup_id,
      approved,
      created_at,
      users:user_id (
        email,
        raw_user_meta_data
      ),
      startups:startup_id (
        id,
        nombre,
        slug,
        ubicacion,
        logo_url
      )
    `)
    .order('approved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching claims:', error)
    return { pending: [], approved: [] }
  }

  const pendingClaims = (claims as unknown as ClaimWithDetails[])?.filter(c => !c.approved) || []
  const approvedClaims = (claims as unknown as ClaimWithDetails[])?.filter(c => c.approved) || []

  return {
    pending: pendingClaims,
    approved: approvedClaims,
  }
}

async function handleApprove(claimId: string) {
  'use server'

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/claims/${claimId}/approve`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Error al aprobar la reclamación')
  }

  return response.json()
}

async function handleReject(claimId: string) {
  'use server'

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/claims/${claimId}/approve`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Error al rechazar la reclamación')
  }

  return response.json()
}

export default async function ClaimsPage() {
  const { pending, approved } = await getClaims()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reclamaciones de Propiedad</h1>
        <p className="text-gray-600 mt-2">
          Revisa y aprueba las reclamaciones de propiedad de startups
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reclamaciones Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Requieren revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reclamaciones Aprobadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approved.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Propietarios verificados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Claims */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <CardTitle>Reclamaciones Pendientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay reclamaciones pendientes de revisión
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 text-sm font-medium text-gray-600">Startup</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Usuario</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Ubicación</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {claim.startups.logo_url ? (
                            <img
                              src={claim.startups.logo_url}
                              alt={claim.startups.nombre}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{claim.startups.nombre}</p>
                            <Link
                              href={`/startups/${claim.startups.slug}`}
                              className="text-xs text-blue-600 hover:underline"
                              target="_blank"
                            >
                              Ver perfil →
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {claim.users?.raw_user_meta_data?.full_name || 'Sin nombre'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">{claim.users?.email}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">{claim.startups.ubicacion}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(claim.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <form action={async () => {
                            'use server'
                            await handleApprove(claim.id)
                          }}>
                            <Button size="sm" variant="default" type="submit">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                          </form>
                          <form action={async () => {
                            'use server'
                            await handleReject(claim.id)
                          }}>
                            <Button size="sm" variant="destructive" type="submit">
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Claims */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle>Propietarios Verificados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {approved.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay propietarios verificados aún
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 text-sm font-medium text-gray-600">Startup</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Propietario</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Ubicación</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Aprobado</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-100">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {claim.startups.logo_url ? (
                            <img
                              src={claim.startups.logo_url}
                              alt={claim.startups.nombre}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{claim.startups.nombre}</p>
                            <Link
                              href={`/startups/${claim.startups.slug}`}
                              className="text-xs text-blue-600 hover:underline"
                              target="_blank"
                            >
                              Ver perfil →
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-900">
                          {claim.users?.raw_user_meta_data?.full_name || 'Sin nombre'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">{claim.users?.email}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-600">{claim.startups.ubicacion}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(claim.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
