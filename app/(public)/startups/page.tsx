import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StartupCard } from '@/components/startups/startup-card'
import { Filters } from '@/components/startups/filters'
import { getApprovedStartups, getFilterOptions } from '@/lib/api/startups'
import { ArrowLeft } from 'lucide-react'

interface StartupsPageProps {
  searchParams: Promise<{
    page?: string
    query?: string
    location?: string
    tags?: string
    yearFrom?: string
    yearTo?: string
    employees?: string
  }>
}

export default async function StartupsPage({ searchParams }: StartupsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const filters = {
    query: params.query,
    location: params.location,
    tags: params.tags ? params.tags.split(',') : undefined,
    yearFrom: params.yearFrom ? parseInt(params.yearFrom, 10) : undefined,
    yearTo: params.yearTo ? parseInt(params.yearTo, 10) : undefined,
    employees: params.employees
  }

  // Fetch data in parallel
  const [startupsResult, filterOptionsResult] = await Promise.all([
    getApprovedStartups(page, 20, filters),
    getFilterOptions()
  ])

  const { data: startups, count, error } = startupsResult
  const { locations, tags, years } = filterOptionsResult

  const totalPages = Math.ceil((count || 0) / 20)
  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Aragón Startups
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Directorio de Startups</h1>
            <p className="text-muted-foreground">
              {count > 0
                ? `${count} startup${count !== 1 ? 's' : ''} en el ecosistema de Aragón`
                : 'Aún no hay startups registradas'
              }
            </p>
          </div>

          {/* Filters Component */}
          <div className="mb-8">
            <Filters
              locations={locations}
              tags={tags}
              yearRange={years}
              initialFilters={filters}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive font-medium">Error al cargar las startups</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!error && startups.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {hasFilters ? 'No se encontraron resultados' : 'Aún no hay startups'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {hasFilters
                  ? 'Intenta cambiar o eliminar algunos filtros para ver más resultados.'
                  : 'Sé el primero en añadir tu startup al directorio.'
                }
              </p>
              {hasFilters ? (
                <Button asChild>
                  <Link href="/startups">Ver todas las startups</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/submit">Añadir mi Startup</Link>
                </Button>
              )}
            </div>
          )}

          {/* Startup Grid */}
          {!error && startups.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {startups.map((startup) => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    asChild={page > 1}
                  >
                    {page > 1 ? (
                      <Link
                        href={{
                          pathname: '/startups',
                          query: { ...params, page: (page - 1).toString() }
                        }}
                      >
                        Anterior
                      </Link>
                    ) : (
                      <span>Anterior</span>
                    )}
                  </Button>

                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    asChild={page < totalPages}
                  >
                    {page < totalPages ? (
                      <Link
                        href={{
                          pathname: '/startups',
                          query: { ...params, page: (page + 1).toString() }
                        }}
                      >
                        Siguiente
                      </Link>
                    ) : (
                      <span>Siguiente</span>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Aragón Startups. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
