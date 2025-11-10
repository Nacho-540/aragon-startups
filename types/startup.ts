export interface Startup {
  id: string
  nombre: string
  slug: string
  descripcion_breve: string
  descripcion_larga: string
  logo_url: string | null
  año_fundacion: number
  estado: 'active' | 'acquired' | 'closed'
  ubicacion: string
  tags: string[]
  num_empleados: string | null
  web: string | null
  email: string | null
  phone: string | null
  redes_sociales: Record<string, string>
  inversion_recibida: string | null
  pitch_deck_url: string | null
  is_approved: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface StartupSubmission extends Omit<Startup, 'id' | 'is_approved' | 'created_at' | 'updated_at'> {
  submitter_email: string
  admin_notes?: string
  status: 'pending' | 'approved' | 'rejected'
}
