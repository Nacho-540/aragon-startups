'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/submissions/file-upload'
import {
  submissionFormSchema,
  AVAILABLE_SECTORS,
  EMPLOYEE_RANGES,
  COMPANY_STATES,
  type SubmissionFormValues,
} from '@/lib/validations/submission'

export default function ManualAddStartupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      estado: 'active',
      tags: [],
      redes_sociales: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
      },
      submitter_email: 'admin@aragon-startups.com',
    },
  })

  // Log validation errors
  const onError = (errors: any) => {
    console.error('❌ Validation errors:', errors)
    alert('Por favor, revisa los campos del formulario. Hay errores de validación.')
  }

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag].slice(0, 5)

    setSelectedTags(newTags)
    setValue('tags', newTags, { shouldValidate: true })
  }

  const onSubmit = async (data: SubmissionFormValues) => {
    console.log('🚀 Form submit started')
    console.log('📋 Form data:', data)

    try {
      setIsSubmitting(true)

      // Create FormData for file uploads
      const formData = new FormData()

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'redes_sociales') {
          formData.append(key, JSON.stringify(value))
        } else if (key === 'tags') {
          formData.append(key, JSON.stringify(value))
        } else if (key === 'logo_file' && value instanceof File) {
          formData.append('logo', value)
        } else if (key === 'pitch_deck_file' && value instanceof File) {
          formData.append('pitch_deck', value)
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value))
        }
      })

      // Add flag to indicate this is an admin direct add
      formData.append('admin_direct_add', 'true')

      console.log('📤 Sending request to API...')

      const response = await fetch('/api/admin/startups/create', {
        method: 'POST',
        body: formData,
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ API error:', error)
        throw new Error(error.message || 'Error al crear la startup')
      }

      const result = await response.json()
      console.log('✅ Startup created:', result)

      alert('¡Startup creada con éxito!')
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('❌ Create startup error:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la startup')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Añadir Startup Manualmente</h1>
        <p className="text-gray-600 mt-2">
          Añade una nueva startup directamente sin proceso de revisión
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              ⚠️ Hay errores en el formulario:
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error?.message as string}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>

            <div>
              <Label htmlFor="nombre">Nombre de la Startup *</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: TechVenture"
                className={`mt-1 ${errors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.nombre && (
                <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion_breve">Descripción Breve * (20-200 caracteres)</Label>
              <Textarea
                id="descripcion_breve"
                {...register('descripcion_breve')}
                placeholder="Una frase que resuma la startup"
                rows={2}
                className={`mt-1 ${errors.descripcion_breve ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {watch('descripcion_breve')?.length || 0} / 200 caracteres
              </p>
              {errors.descripcion_breve && (
                <p className="text-sm text-red-600 mt-1">{errors.descripcion_breve.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion_larga">Descripción Completa * (100-2000 caracteres)</Label>
              <Textarea
                id="descripcion_larga"
                {...register('descripcion_larga')}
                placeholder="Describe la startup, qué problema resuelve, su propuesta de valor..."
                rows={6}
                className={`mt-1 ${errors.descripcion_larga ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {watch('descripcion_larga')?.length || 0} / 2000 caracteres
              </p>
              {errors.descripcion_larga && (
                <p className="text-sm text-red-600 mt-1">{errors.descripcion_larga.message}</p>
              )}
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900">Detalles de la Empresa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="año_fundacion">Año de Fundación *</Label>
                <Input
                  id="año_fundacion"
                  type="number"
                  {...register('año_fundacion', { valueAsNumber: true })}
                  placeholder={String(new Date().getFullYear())}
                  className={`mt-1 ${errors.año_fundacion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.año_fundacion && (
                  <p className="text-sm text-red-600 mt-1">{errors.año_fundacion.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación *</Label>
                <Input
                  id="ubicacion"
                  {...register('ubicacion')}
                  placeholder="Ej: Zaragoza, España"
                  className={`mt-1 ${errors.ubicacion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.ubicacion && (
                  <p className="text-sm text-red-600 mt-1">{errors.ubicacion.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label className={errors.tags ? 'text-red-600' : ''}>Sectores * (Selecciona 1-5)</Label>
              <div className={`mt-2 flex flex-wrap gap-2 p-3 rounded-md ${errors.tags ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-200'}`}>
                {AVAILABLE_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => toggleTag(sector)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                      ${
                        selectedTags.includes(sector)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {sector}
                  </button>
                ))}
              </div>
              {errors.tags && (
                <p className="text-sm text-red-600 mt-2">{errors.tags.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="num_empleados">Número de Empleados</Label>
                <Select
                  value={watch('num_empleados') || ''}
                  onValueChange={(value) => setValue('num_empleados', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un rango" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estado">Estado de la Empresa *</Label>
                <Select
                  value={watch('estado')}
                  onValueChange={(value) => setValue('estado', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900">Contacto y Enlaces</h2>

            <div>
              <Label htmlFor="web">Sitio Web</Label>
              <Input
                id="web"
                type="url"
                {...register('web')}
                placeholder="https://example.com"
                className={`mt-1 ${errors.web ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.web && (
                <p className="text-sm text-red-600 mt-1">{errors.web.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email">Email de Contacto</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contact@example.com"
                  className={`mt-1 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+34 600 000 000"
                  className={`mt-1 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Redes Sociales (Opcional)</Label>
              <div className="space-y-3">
                <Input
                  {...register('redes_sociales.linkedin')}
                  placeholder="LinkedIn URL"
                  className={errors.redes_sociales?.linkedin ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.redes_sociales?.linkedin && (
                  <p className="text-sm text-red-600 mt-1">{errors.redes_sociales.linkedin.message}</p>
                )}
                <Input
                  {...register('redes_sociales.twitter')}
                  placeholder="Twitter/X URL"
                  className={errors.redes_sociales?.twitter ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.redes_sociales?.twitter && (
                  <p className="text-sm text-red-600 mt-1">{errors.redes_sociales.twitter.message}</p>
                )}
                <Input
                  {...register('redes_sociales.facebook')}
                  placeholder="Facebook URL"
                  className={errors.redes_sociales?.facebook ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.redes_sociales?.facebook && (
                  <p className="text-sm text-red-600 mt-1">{errors.redes_sociales.facebook.message}</p>
                )}
                <Input
                  {...register('redes_sociales.instagram')}
                  placeholder="Instagram URL"
                  className={errors.redes_sociales?.instagram ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.redes_sociales?.instagram && (
                  <p className="text-sm text-red-600 mt-1">{errors.redes_sociales.instagram.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Funding & Files */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900">Financiación y Archivos</h2>

            <div>
              <Label htmlFor="inversion_recibida">Inversión Recibida (Opcional)</Label>
              <Input
                id="inversion_recibida"
                {...register('inversion_recibida')}
                placeholder="Ej: €500K Seed Round"
                className="mt-1"
              />
            </div>

            <FileUpload
              accept=".png,.jpg,.jpeg,.svg"
              maxSize={5 * 1024 * 1024}
              label="Logo de la Startup"
              description="PNG, JPG, JPEG o SVG - Máximo 5MB"
              onFileSelect={(file) => setValue('logo_file', file)}
              value={watch('logo_file') as File}
              preview
            />

            <FileUpload
              accept=".pdf"
              maxSize={10 * 1024 * 1024}
              label="Pitch Deck (Opcional)"
              description="PDF - Máximo 10MB"
              onFileSelect={(file) => setValue('pitch_deck_file', file)}
              value={watch('pitch_deck_file') as File}
              preview={false}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t flex justify-end gap-4">
            <Link href="/admin">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Startup'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
