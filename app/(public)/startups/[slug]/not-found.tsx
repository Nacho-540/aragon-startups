import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
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

      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
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

          <h1 className="text-4xl font-bold mb-4">Startup no encontrada</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Lo sentimos, no pudimos encontrar la startup que buscas.
            Puede que haya sido eliminada o que la URL sea incorrecta.
          </p>

          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/startups">Ver todas las startups</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </div>
      </main>

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
