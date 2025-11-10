export type UserRole = 'entrepreneur' | 'investor' | 'admin'

export interface UserMetadata {
  role: UserRole
  full_name?: string
  company?: string
}

export interface User {
  id: string
  email: string
  user_metadata: UserMetadata
  created_at: string
}
