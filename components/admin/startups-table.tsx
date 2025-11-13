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
import { Edit2, Trash2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Startup {
  id: string
  nombre: string
  slug: string
  descripcion_breve: string
  logo_url: string | null
  ubicacion: string
  tags: string[]
  estado: string
  is_approved: boolean
  created_at: string
  año_fundacion: number | null
  num_empleados: string | null
  web: string | null
}

interface StartupsTableProps {
  startups: Startup[]
}

export function StartupsTable({ startups }: StartupsTableProps) {
  const router = useRouter()
  const [deletingStartup, setDeletingStartup] = useState<Startup | null>(null)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Activa</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactiva</Badge>
      case 'archived':
        return <Badge variant="outline">Archivada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleDelete = async (startup: Startup) => {
    if (!confirm(`¿Estás seguro de eliminar la startup "${startup.nombre}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/startups/${startup.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la startup')
      }

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la startup')
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Startup</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Etiquetas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Aprobada</TableHead>
            <TableHead>Fundación</TableHead>
            <TableHead>Registrada</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {startups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No hay startups registradas
              </TableCell>
            </TableRow>
          ) : (
            startups.map((startup) => (
              <TableRow key={startup.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {startup.logo_url && (
                      <img
                        src={startup.logo_url}
                        alt={startup.nombre}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{startup.nombre}</span>
                      <span className="text-sm text-muted-foreground">
                        /{startup.slug}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{startup.ubicacion}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {startup.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {startup.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{startup.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getEstadoBadge(startup.estado)}</TableCell>
                <TableCell>
                  {startup.is_approved ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Sí</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">No</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {startup.año_fundacion || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(startup.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {startup.web && (
                      <Link href={startup.web} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/startups/${startup.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(startup)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
