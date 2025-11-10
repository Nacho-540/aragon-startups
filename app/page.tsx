import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
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

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Ecosistema de Startups de Aragón
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubre, conecta y potencia el ecosistema innovador de Aragón.
            Un directorio completo de startups, emprendedores e inversores.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/startups">Explorar Startups</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Unirme al Ecosistema</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
            <div>
              <p className="text-4xl font-bold">0+</p>
              <p className="text-muted-foreground mt-2">Startups Registradas</p>
            </div>
            <div>
              <p className="text-4xl font-bold">0+</p>
              <p className="text-muted-foreground mt-2">Emprendedores</p>
            </div>
            <div>
              <p className="text-4xl font-bold">0+</p>
              <p className="text-muted-foreground mt-2">Inversores</p>
            </div>
          </div>
        </div>
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
