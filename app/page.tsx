import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFeaturedStartups, getStartupStats } from '@/lib/api/startups'
import { Building2, MapPin, Calendar } from 'lucide-react'

export default async function Home() {
  // Fetch data in parallel
  const [featuredResult, stats] = await Promise.all([
    getFeaturedStartups(),
    getStartupStats()
  ])

  const featuredStartups = featuredResult.data

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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Ecosistema de Startups de Aragón
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubre, conecta y potencia el ecosistema innovador de Aragón.
            Un directorio completo de startups, emprendedores e inversores.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/startups">Explorar Startups</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/submit">Añadir mi Startup</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
            <div>
              <p className="text-4xl font-bold">{stats.totalStartups}+</p>
              <p className="text-muted-foreground mt-2">Startups Registradas</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{stats.totalCities}+</p>
              <p className="text-muted-foreground mt-2">Ciudades</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{stats.totalIndustries}+</p>
              <p className="text-muted-foreground mt-2">Sectores</p>
            </div>
          </div>
        </section>

        {/* Featured Startups */}
        {featuredStartups.length > 0 && (
          <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Startups Destacadas</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Conoce algunas de las startups más innovadoras del ecosistema aragonés
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredStartups.map((startup) => (
                  <Card key={startup.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4 mb-2">
                        {startup.logo_url ? (
                          <img
                            src={startup.logo_url}
                            alt={`Logo de ${startup.nombre}`}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{startup.nombre}</CardTitle>
                          {startup.tags && startup.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {startup.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {startup.descripcion_breve}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {startup.ubicacion && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{startup.ubicacion}</span>
                          </div>
                        )}
                        {startup.año_fundacion && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{startup.año_fundacion}</span>
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
                ))}
              </div>

              <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link href="/startups">Ver Todas las Startups</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Eres emprendedor o inversor?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Únete al ecosistema de innovación de Aragón. Conecta con inversores,
              encuentra oportunidades y haz crecer tu startup.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Crear Cuenta</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent hover:bg-primary-foreground/10" asChild>
                <Link href="/submit">Añadir mi Startup</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Aragón Startups. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
