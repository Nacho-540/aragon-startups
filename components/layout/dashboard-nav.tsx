'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/auth-helpers'

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const userRole = user.user_metadata?.role || 'entrepreneur'
  const isOwner = userRole === 'entrepreneur' // Simplification - in real app, check if user owns a startup

  async function handleSignOut() {
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Panel principal',
      show: true,
    },
    {
      href: '/dashboard/my-startup',
      label: 'Mi Startup',
      show: isOwner,
    },
    {
      href: '/dashboard/profile',
      label: 'Mi perfil',
      show: true,
    },
    {
      href: '/admin',
      label: 'Administración',
      show: userRole === 'admin',
    },
  ]

  return (
    <aside className="w-64 border-r bg-muted/40 p-6">
      {/* Logo/Brand */}
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold">
          Aragón Startups
        </Link>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 rounded-lg bg-background border">
        <p className="font-medium truncate">{user.user_metadata?.full_name}</p>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {userRole === 'entrepreneur' ? 'Emprendedor' : userRole === 'investor' ? 'Inversor' : 'Admin'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-6 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
