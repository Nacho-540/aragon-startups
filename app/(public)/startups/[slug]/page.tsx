import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getStartupBySlug } from '@/lib/api/startups'
import { ClaimButton } from '@/components/startups/claim-button'
import { CopyableField } from '@/components/startups/copyable-field'
import { PitchDeckButton } from '@/components/startups/pitch-deck-button'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  Globe,
  Linkedin,
  Twitter,
  Lock,
  Download,
  ExternalLink
} from 'lucide-react'
import type { Metadata } from 'next'

interface StartupDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: StartupDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: startup } = await getStartupBySlug(slug)

  if (!startup) {
    return {
      title: 'Startup no encontrada'
    }
  }

  return {
    title: `${startup.nombre} | Aragón Startups`,
    description: startup.descripcion_breve,
    openGraph: {
      title: startup.nombre,
      description: startup.descripcion_breve,
      images: startup.logo_url ? [startup.logo_url] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title: startup.nombre,
      description: startup.descripcion_breve,
      images: startup.logo_url ? [startup.logo_url] : []
    }
  }
}

export default async function StartupDetailPage({ params }: StartupDetailPageProps) {
  const { slug } = await params
  const { data: startup, error, isPremiumVisible } = await getStartupBySlug(slug)

  if (error || !startup) {
    notFound()
  }

  // Get current user and check for ownership claim
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role

  // Check if user has claimed this startup
  let existingClaim = null
  if (user) {
    const { data: claimData } = await supabase
      .from('startup_owners')
      .select('id, approved')
      .eq('user_id', user.id)
      .eq('startup_id', startup.id)
      .maybeSingle()

    existingClaim = claimData
  }

  // Social media links
  const socialLinks = startup.redes_sociales || {}

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
              <Link href="/startups" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al directorio
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="bg-muted/50 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo */}
              {startup.logo_url ? (
                <img
                  src={startup.logo_url}
                  alt={`Logo de ${startup.nombre}`}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{startup.nombre}</h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {startup.descripcion_breve}
                </p>

                {/* Tags */}
                {startup.tags && startup.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {startup.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {startup.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{startup.ubicacion}</span>
                    </div>
                  )}
                  {startup.año_fundacion && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Fundada en {startup.año_fundacion}</span>
                    </div>
                  )}
                  {startup.num_empleados && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{startup.num_empleados} empleados</span>
                    </div>
                  )}
                </div>

                {/* Website */}
                {startup.web && (
                  <div className="mt-4">
                    <Button asChild>
                      <a
                        href={startup.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        Visitar sitio web
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre {startup.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {startup.descripcion_larga}
                  </p>
                </CardContent>
              </Card>

              {/* Funding */}
              {startup.inversion_recibida && (
                <Card>
                  <CardHeader>
                    <CardTitle>Inversión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      {startup.inversion_recibida}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inversión recibida
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info - Premium Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  {!isPremiumVisible && (
                    <CardDescription>
                      Solo disponible para inversores registrados
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {isPremiumVisible ? (
                    <>
                      {/* Premium: Show Contact with Copy-to-Clipboard */}
                      {startup.email && (
                        <CopyableField
                          value={startup.email}
                          label="Email de Contacto"
                          type="email"
                        />
                      )}
                      {startup.phone && (
                        <CopyableField
                          value={startup.phone}
                          label="Teléfono"
                          type="phone"
                        />
                      )}
                      {!startup.email && !startup.phone && (
                        <p className="text-sm text-muted-foreground">
                          No hay información de contacto disponible
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Non-premium: Show Locked */}
                      <div className="bg-muted/50 rounded-lg p-6 text-center space-y-3">
                        <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Contenido Premium</p>
                        <p className="text-xs text-muted-foreground">
                          Regístrate como inversor para acceder a información de contacto
                        </p>
                        <Button size="sm" className="w-full" asChild>
                          <Link href="/register">Crear Cuenta de Inversor</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pitch Deck - Premium Content */}
              {startup.pitch_deck_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pitch Deck</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isPremiumVisible ? (
                      <PitchDeckButton
                        startupId={startup.id}
                        startupName={startup.nombre}
                      />
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-6 text-center space-y-3">
                        <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Contenido Premium</p>
                        <p className="text-xs text-muted-foreground">
                          Solo inversores registrados pueden descargar el pitch deck
                        </p>
                        <Button size="sm" className="w-full" asChild>
                          <Link href="/register">Crear Cuenta de Inversor</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {socialLinks.linkedin && (
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <a
                          href={socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {socialLinks.twitter && (
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <a
                          href={socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {socialLinks.facebook && (
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <a
                          href={socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={`font-medium ${
                      startup.estado === 'active'
                        ? 'text-green-600'
                        : startup.estado === 'acquired'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}>
                      {startup.estado === 'active' && 'Activa'}
                      {startup.estado === 'acquired' && 'Adquirida'}
                      {startup.estado === 'closed' && 'Cerrada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de registro:</span>
                    <span className="font-medium">
                      {new Date(startup.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Claim Button */}
              {user ? (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6 space-y-3">
                    <p className="text-sm font-medium text-center">¿Esta es tu startup?</p>
                    <ClaimButton
                      startupId={startup.id}
                      startupName={startup.nombre}
                      userRole={userRole}
                      existingClaim={existingClaim}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6 text-center space-y-3">
                    <p className="text-sm font-medium">¿Esta es tu startup?</p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">Iniciar sesión para reclamar</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
