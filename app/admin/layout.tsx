import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, FileText, Users, PlusCircle, LogOut, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is authenticated
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const userRole = user.user_metadata?.role
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/submissions"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Solicitudes</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Usuarios</span>
            </Link>

            <Link
              href="/admin/startups"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              <span>Startups</span>
            </Link>

            <Link
              href="/admin/startups/new"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Añadir Startup</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <form action="/api/auth/logout" method="post">
              <Button
                type="submit"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">{children}</div>
    </div>
  )
}
