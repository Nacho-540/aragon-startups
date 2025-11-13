'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { UserEditModal } from './user-edit-modal'
import { UserDeleteDialog } from './user-delete-dialog'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

interface UserTableProps {
  users: User[]
  currentUserId: string
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-600">Admin</Badge>
      case 'investor':
        return <Badge variant="default" className="bg-green-600">Inversor</Badge>
      case 'entrepreneur':
        return <Badge variant="default" className="bg-blue-600">Emprendedor</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const isCurrentUser = (userId: string) => userId === currentUserId

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead>Último acceso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                      {isCurrentUser(user.id) && (
                        <Badge variant="outline" className="w-fit mt-1 text-xs">
                          Tú
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.email_confirmed_at ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Verificado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Pendiente</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.last_sign_in_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        disabled={isCurrentUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          isCurrentUser={isCurrentUser(editingUser.id)}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null)
            router.refresh()
          }}
        />
      )}

      {/* Delete Dialog */}
      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onSuccess={() => {
            setDeletingUser(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
