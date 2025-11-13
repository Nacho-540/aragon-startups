import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Error al cerrar sesión' },
        { status: 500 }
      )
    }

    // Redirect to login page
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('Unexpected logout error:', error)
    return NextResponse.json(
      { error: 'Error inesperado al cerrar sesión' },
      { status: 500 }
    )
  }
}
