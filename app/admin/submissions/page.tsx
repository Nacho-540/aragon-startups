import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Submission {
  id: string
  nombre: string
  ubicacion: string
  tags: string[]
  submitter_email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  admin_notes?: string
}

async function getSubmissions(status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: submissions, error } = await query

  if (error) {
    console.error('Error fetching submissions:', error)
    return []
  }

  return submissions as Submission[]
}

async function getCounts() {
  const supabase = await createClient()

  const [
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ])

  return {
    pending: pendingCount || 0,
    approved: approvedCount || 0,
    rejected: rejectedCount || 0,
  }
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status
  const submissions = await getSubmissions(status)
  const counts = await getCounts()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Startups</h1>
        <p className="text-gray-600 mt-2">
          Revisa y aprueba las solicitudes de nuevas startups
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link href="/admin/submissions">
          <Button
            variant={!status ? 'default' : 'outline'}
            size="sm"
          >
            Todas ({counts.pending + counts.approved + counts.rejected})
          </Button>
        </Link>
        <Link href="/admin/submissions?status=pending">
          <Button
            variant={status === 'pending' ? 'default' : 'outline'}
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pendientes ({counts.pending})
          </Button>
        </Link>
        <Link href="/admin/submissions?status=approved">
          <Button
            variant={status === 'approved' ? 'default' : 'outline'}
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprobadas ({counts.approved})
          </Button>
        </Link>
        <Link href="/admin/submissions?status=rejected">
          <Button
            variant={status === 'rejected' ? 'default' : 'outline'}
            size="sm"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rechazadas ({counts.rejected})
          </Button>
        </Link>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {status === 'pending' && 'Solicitudes Pendientes'}
            {status === 'approved' && 'Solicitudes Aprobadas'}
            {status === 'rejected' && 'Solicitudes Rechazadas'}
            {!status && 'Todas las Solicitudes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay solicitudes {status ? `con estado "${status}"` : ''}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 text-sm font-medium text-gray-600">Nombre</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Ubicación</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Sectores</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Estado</th>
                    <th className="pb-3 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4">
                        <p className="font-medium text-gray-900">{submission.nombre}</p>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {submission.ubicacion}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {submission.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {submission.tags.length > 2 && (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{submission.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {submission.submitter_email}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {new Date(submission.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-4">
                        <span
                          className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              submission.status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : submission.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          `}
                        >
                          {submission.status === 'pending' && (
                            <Clock className="w-3 h-3" />
                          )}
                          {submission.status === 'approved' && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {submission.status === 'rejected' && (
                            <XCircle className="w-3 h-3" />
                          )}
                          {submission.status === 'pending' && 'Pendiente'}
                          {submission.status === 'approved' && 'Aprobada'}
                          {submission.status === 'rejected' && 'Rechazada'}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link href={`/admin/submissions/${submission.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4 mr-1" />
                            Revisar
                          </Button>
                        </Link>
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
