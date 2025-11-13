'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

interface UserDeleteDialogProps {
  user: User
  onClose: () => void
  onSuccess: () => void
}

export function UserDeleteDialog({ user, onClose, onSuccess }: UserDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el usuario')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            ¿Eliminar usuario?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Estás a punto de eliminar al usuario{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {user.full_name}
              </span>{' '}
              ({user.email}).
            </p>
            <p className="font-medium text-red-600">
              Esta acción es permanente y no se puede deshacer.
            </p>
            <p>Se eliminarán:</p>
            <ul className="list-disc list-inside text-sm space-y-1 pl-2">
              <li>La cuenta del usuario</li>
              <li>Sus reclamos de startups pendientes</li>
              <li>Su acceso al sistema</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Usuario'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
