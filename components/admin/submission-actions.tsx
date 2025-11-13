'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface SubmissionActionsProps {
  submission: any
}

export function SubmissionActions({ submission }: SubmissionActionsProps) {
  const router = useRouter()
  const [adminNotes, setAdminNotes] = useState(submission.admin_notes || '')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    if (!confirm('¿Estás seguro de que quieres aprobar esta solicitud? Se creará la startup y se notificará al solicitante.')) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          // Conflict - duplicate slug
          alert(
            `⚠️ Conflicto de Slug\n\n${result.error}\n\n` +
            `Por favor, edita el nombre de la startup en la submission para generar un slug único, ` +
            `o elimina la startup existente si es un duplicado.`
          )
        } else {
          throw new Error(result.error || 'Error al aprobar')
        }
        return
      }

      alert('✅ Solicitud aprobada con éxito\n\nLa startup ha sido creada y publicada.')
      router.push('/admin/submissions?status=approved')
      router.refresh()
    } catch (error) {
      console.error('Approval error:', error)
      alert(
        '❌ Error al aprobar la solicitud\n\n' +
        (error instanceof Error ? error.message : 'Error desconocido')
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      alert('Por favor, añade una nota explicando el motivo del rechazo')
      return
    }

    if (!confirm('¿Estás seguro de que quieres rechazar esta solicitud? Se notificará al solicitante.')) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al rechazar')
      }

      alert('Solicitud rechazada con éxito')
      router.push('/admin/submissions?status=rejected')
      router.refresh()
    } catch (error) {
      console.error('Rejection error:', error)
      alert(error instanceof Error ? error.message : 'Error al rechazar la solicitud')
    } finally {
      setIsProcessing(false)
    }
  }

  const isPending = submission.status === 'pending'

  return (
    <div className="space-y-4">
      {/* Admin Notes */}
      <div>
        <Label htmlFor="admin_notes">Notas del Administrador</Label>
        <Textarea
          id="admin_notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Añade notas sobre esta solicitud (requeridas para rechazar)"
          rows={4}
          className="mt-2"
          disabled={!isPending || isProcessing}
        />
      </div>

      {/* Action Buttons */}
      {isPending ? (
        <div className="space-y-2">
          <Button
            onClick={handleApprove}
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar Solicitud
              </>
            )}
          </Button>

          <Button
            onClick={handleReject}
            variant="destructive"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar Solicitud
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Esta solicitud ya ha sido{' '}
            <span className="font-medium">
              {submission.status === 'approved' ? 'aprobada' : 'rechazada'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
