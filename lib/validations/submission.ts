import { z } from 'zod'

// Submission form validation schema
export const submissionFormSchema = z.object({
  // Step 1: Basic Info
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  descripcion_breve: z.string()
    .min(20, 'La descripción breve debe tener al menos 20 caracteres')
    .max(200, 'La descripción breve no puede exceder 200 caracteres'),

  descripcion_larga: z.string()
    .min(100, 'La descripción completa debe tener al menos 100 caracteres')
    .max(2000, 'La descripción completa no puede exceder 2000 caracteres'),

  // Step 2: Company Details
  año_fundacion: z.number()
    .int('El año debe ser un número entero')
    .min(1900, 'El año debe ser mayor a 1900')
    .max(new Date().getFullYear(), 'El año no puede ser futuro'),

  ubicacion: z.string()
    .min(2, 'La ubicación debe tener al menos 2 caracteres')
    .max(100, 'La ubicación no puede exceder 100 caracteres'),

  tags: z.array(z.string())
    .min(1, 'Selecciona al menos un sector')
    .max(5, 'Máximo 5 sectores'),

  num_empleados: z.enum(['1-10', '11-50', '51-200', '201-500', '500+'])
    .optional()
    .nullable(),

  estado: z.enum(['active', 'acquired', 'closed']),

  // Step 3: Contact & Links
  web: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      { message: 'Debe ser una URL válida' }
    ),

  email: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val === '' || z.string().email().safeParse(val).success,
      { message: 'Debe ser un email válido' }
    ),

  phone: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val === '' || /^\+?[\d\s-()]+$/.test(val),
      { message: 'Formato de teléfono inválido' }
    ),

  redes_sociales: z.object({
    linkedin: z.string()
      .optional()
      .refine(
        (val) => !val || val === '' || z.string().url().safeParse(val).success,
        { message: 'URL de LinkedIn inválida' }
      ),
    twitter: z.string()
      .optional()
      .refine(
        (val) => !val || val === '' || z.string().url().safeParse(val).success,
        { message: 'URL de Twitter inválida' }
      ),
    facebook: z.string()
      .optional()
      .refine(
        (val) => !val || val === '' || z.string().url().safeParse(val).success,
        { message: 'URL de Facebook inválida' }
      ),
    instagram: z.string()
      .optional()
      .refine(
        (val) => !val || val === '' || z.string().url().safeParse(val).success,
        { message: 'URL de Instagram inválida' }
      ),
  }).optional(),

  // Step 4: Funding & Pitch
  inversion_recibida: z.string()
    .optional()
    .nullable()
    .or(z.literal('')),

  // Files handled separately in form
  logo_file: z.any().optional(),
  pitch_deck_file: z.any().optional(),

  // Step 5: Submitter Email
  submitter_email: z.string()
    .email('Debe ser un email válido')
    .min(1, 'El email es requerido'),
})

export type SubmissionFormValues = z.infer<typeof submissionFormSchema>

// Schema for each step to validate progressively
export const step1Schema = submissionFormSchema.pick({
  nombre: true,
  descripcion_breve: true,
  descripcion_larga: true,
})

export const step2Schema = submissionFormSchema.pick({
  año_fundacion: true,
  ubicacion: true,
  tags: true,
  num_empleados: true,
  estado: true,
})

export const step3Schema = submissionFormSchema.pick({
  web: true,
  email: true,
  phone: true,
  redes_sociales: true,
})

export const step4Schema = submissionFormSchema.pick({
  inversion_recibida: true,
  logo_file: true,
  pitch_deck_file: true,
})

export const step5Schema = submissionFormSchema.pick({
  submitter_email: true,
})

// Available sectors/tags
export const AVAILABLE_SECTORS = [
  'Agritech',
  'Biotech',
  'Cleantech',
  'E-commerce',
  'Edtech',
  'Fintech',
  'Foodtech',
  'Healthtech',
  'Legaltech',
  'Proptech',
  'SaaS',
  'Social Impact',
  'Tourism',
  'Other',
] as const

// Available employee ranges
export const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
] as const

// Available company states
export const COMPANY_STATES = [
  { value: 'active', label: 'Activa' },
  { value: 'acquired', label: 'Adquirida' },
  { value: 'closed', label: 'Cerrada' },
] as const
