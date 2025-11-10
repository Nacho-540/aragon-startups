import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Check if this is a password recovery flow
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  // Handle password recovery token (old-style Supabase links)
  if (token && type === 'recovery') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })

    if (!error) {
      return NextResponse.redirect(new URL('/update-password', origin))
    }

    return NextResponse.redirect(new URL('/login?error=recovery', origin))
  }

  // Handle PKCE flow (new-style Supabase links with code)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const redirectTo = next ?? '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, origin))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=auth', origin))
}
