import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next')
  const code = searchParams.get('code')

  const supabase = await createClient()

  // Handle password recovery with token_hash
  if (token_hash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'recovery',
    })

    if (!error) {
      return NextResponse.redirect(new URL('/update-password', origin))
    }

    return NextResponse.redirect(new URL('/login?error=recovery', origin))
  }

  // Handle PKCE code exchange (for email confirmation, password reset with code, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If the user just recovered password, redirect to update-password
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/update-password', origin))
      }

      // Otherwise redirect to dashboard or custom next URL
      const redirectTo = next ?? '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, origin))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=auth', origin))
}
