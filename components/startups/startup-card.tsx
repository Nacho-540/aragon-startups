import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Calendar, Users } from 'lucide-react'
import type { Startup } from '@/types/startup'

interface StartupCardProps {
  startup: Partial<Startup>
}

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4 mb-2">
          {startup.logo_url ? (
            <img
              src={startup.logo_url}
              alt={`Logo de ${startup.nombre}`}
              className="w-16 h-16 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{startup.nombre}</CardTitle>
            {startup.tags && startup.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {startup.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {startup.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground px-2 py-0.5">
                    +{startup.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {startup.descripcion_breve}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4 flex-1">
          {startup.ubicacion && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{startup.ubicacion}</span>
            </div>
          )}
          {startup.año_fundacion && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Fundada en {startup.año_fundacion}</span>
            </div>
          )}
          {startup.num_empleados && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{startup.num_empleados} empleados</span>
            </div>
          )}
          {startup.estado && startup.estado !== 'active' && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                startup.estado === 'acquired'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {startup.estado === 'acquired' ? 'Adquirida' : 'Cerrada'}
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/startups/${startup.slug}`}>
            Ver Detalles
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
