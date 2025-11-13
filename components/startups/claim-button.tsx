'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface ClaimButtonProps {
  startupId: string
  startupName: string
  userRole?: string
  existingClaim?: {
    id: string
    approved: boolean
  } | null
}

export function ClaimButton({
  startupId,
  startupName,
  userRole,
  existingClaim
}: ClaimButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Don't show button if user is not an entrepreneur
  if (!userRole || userRole !== 'entrepreneur') {
    return null
  }

  // If claim exists and is approved, show "Your startup" status
  if (existingClaim?.approved) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-900 dark:text-green-100">
          Esta es tu startup
        </span>
      </div>
    )
  }

  // If claim exists but is pending, show pending status
  if (existingClaim && !existingClaim.approved) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Reclamación pendiente de aprobación
        </span>
      </div>
    )
  }

  const handleClaim = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/startups/${startupId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la reclamación')
      }

      // Success - close dialog and refresh page
      setIsOpen(false)
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          Reclamar esta startup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reclamar propiedad de la startup</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Estás a punto de reclamar la propiedad de <strong>{startupName}</strong>.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Proceso de reclamación:</strong>
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-900 dark:text-blue-100 mt-2 space-y-1">
                <li>Enviarás una solicitud de reclamación</li>
                <li>Un administrador revisará tu solicitud</li>
                <li>Recibirás una notificación cuando sea aprobada</li>
                <li>Podrás editar la información de tu startup</li>
              </ol>
            </div>
            <p className="text-sm text-muted-foreground">
              Solo puedes reclamar startups de las que eres propietario o fundador.
              Las reclamaciones falsas pueden resultar en la suspensión de tu cuenta.
            </p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleClaim}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar reclamación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
