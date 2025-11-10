import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/user'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  role: UserRole
  company?: string
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData) {
  const supabase = createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: data.role,
        company: data.company || null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return authData
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData) {
  const supabase = createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    throw error
  }

  return authData
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  })

  if (error) {
    throw error
  }
}

/**
 * Update password for authenticated user
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

/**
 * Get user role from metadata
 */
export function getUserRole(user: any): UserRole {
  return user?.user_metadata?.role || 'entrepreneur'
}

/**
 * Check if user is admin
 */
export function isAdmin(user: any): boolean {
  return getUserRole(user) === 'admin'
}

/**
 * Check if user is investor
 */
export function isInvestor(user: any): boolean {
  return getUserRole(user) === 'investor'
}

/**
 * Check if user is entrepreneur
 */
export function isEntrepreneur(user: any): boolean {
  return getUserRole(user) === 'entrepreneur'
}
