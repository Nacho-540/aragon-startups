import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Building2,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { SubmissionActions } from '@/components/admin/submission-actions'

async function getSubmission(id: string) {
  const supabase = await createClient()

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !submission) {
    return null
  }

  return submission
}

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const submission = await getSubmission(id)

  if (!submission) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{submission.nombre}</h1>
            <p className="text-gray-600 mt-1">
              Solicitud recibida el {new Date(submission.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
          <Badge className={statusColors[submission.status]}>
            {statusLabels[submission.status]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.logo_url && (
                <div className="flex items-center gap-4">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Logo</p>
                    <img
                      src={submission.logo_url}
                      alt={submission.nombre}
                      className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Descripción Breve
                </h3>
                <p className="text-gray-900">{submission.descripcion_breve}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Descripción Completa
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {submission.descripcion_larga}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Año de Fundación</p>
                    <p className="font-medium">{submission.año_fundacion}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-medium">{submission.ubicacion}</p>
                  </div>
                </div>

                {submission.num_empleados && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Empleados</p>
                      <p className="font-medium">{submission.num_empleados}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="font-medium capitalize">{submission.estado}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Sectores</p>
                <div className="flex flex-wrap gap-2">
                  {submission.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {submission.inversion_recibida && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Inversión Recibida</p>
                    <p className="font-medium">{submission.inversion_recibida}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Links */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto y Enlaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.web && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Sitio Web</p>
                    <a
                      href={submission.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {submission.web}
                    </a>
                  </div>
                </div>
              )}

              {submission.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href={`mailto:${submission.email}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {submission.email}
                    </a>
                  </div>
                </div>
              )}

              {submission.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <a
                      href={`tel:${submission.phone}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {submission.phone}
                    </a>
                  </div>
                </div>
              )}

              {submission.redes_sociales && Object.keys(submission.redes_sociales).length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Redes Sociales</p>
                  <div className="space-y-2">
                    {Object.entries(submission.redes_sociales)
                      .filter(([, url]) => url)
                      .map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pitch Deck */}
          {submission.pitch_deck_url && (
            <Card>
              <CardHeader>
                <CardTitle>Pitch Deck</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Documento PDF</p>
                    <a
                      href={submission.pitch_deck_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Descargar Pitch Deck
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Panel - Right Column (1/3) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Acciones de Moderación</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionActions submission={submission} />
            </CardContent>
          </Card>

          {/* Submitter Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Información del Solicitante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${submission.submitter_email}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {submission.submitter_email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                  <p className="font-medium">
                    {new Date(submission.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {submission.admin_notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notas del Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {submission.admin_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
