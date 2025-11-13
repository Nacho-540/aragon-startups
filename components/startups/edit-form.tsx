'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  submissionFormSchema,
  AVAILABLE_SECTORS,
  EMPLOYEE_RANGES,
  COMPANY_STATES,
  type SubmissionFormValues,
} from '@/lib/validations/submission'

// Funding ranges as defined in database schema
const FUNDING_RANGES = ['€0', '€0-100k', '€100k-500k', '€500k-1M', '€1M+']
import { Loader2, Save, AlertCircle } from 'lucide-react'
import type { Startup } from '@/types/startup'

interface EditFormProps {
  startup: Startup
}

export function EditForm({ startup }: EditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(startup.tags || [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      nombre: startup.nombre,
      descripcion_breve: startup.descripcion_breve,
      descripcion_larga: startup.descripcion_larga,
      ubicacion: startup.ubicacion,
      año_fundacion: startup.año_fundacion || undefined,
      estado: (startup.estado as any) || 'active',
      tags: startup.tags || [],
      num_empleados: startup.num_empleados || undefined,
      web: startup.web || '',
      email: startup.email || '',
      phone: startup.phone || '',
      redes_sociales: {
        linkedin: startup.redes_sociales?.linkedin || '',
        twitter: startup.redes_sociales?.twitter || '',
        facebook: startup.redes_sociales?.facebook || '',
        instagram: startup.redes_sociales?.instagram || '',
      },
      inversion_recibida: startup.inversion_recibida || undefined,
      submitter_email: '', // Not needed for updates
    },
    mode: 'onBlur',
  })

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag].slice(0, 5) // Max 5 tags

    setSelectedTags(newTags)
    setValue('tags', newTags, { shouldValidate: true, shouldDirty: true })
  }

  const onSubmit = async (data: SubmissionFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      // Prepare update data (excluding files and submitter_email)
      const updateData = {
        nombre: data.nombre,
        descripcion_breve: data.descripcion_breve,
        descripcion_larga: data.descripcion_larga,
        ubicacion: data.ubicacion,
        año_fundacion: data.año_fundacion,
        estado: data.estado,
        tags: data.tags,
        num_empleados: data.num_empleados,
        web: data.web,
        email: data.email,
        phone: data.phone,
        redes_sociales: data.redes_sociales,
        inversion_recibida: data.inversion_recibida,
      }

      const response = await fetch(`/api/startups/${startup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la startup')
      }

      setSuccess(true)

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Cambios guardados correctamente
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Datos fundamentales de tu startup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Startup *</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: TechStartup Zaragoza"
            />
            {errors.nombre && (
              <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descripcion_breve">Descripción Breve * (máx. 200 caracteres)</Label>
            <Textarea
              id="descripcion_breve"
              {...register('descripcion_breve')}
              placeholder="Ej: Soluciones tecnológicas innovadoras para empresas"
              maxLength={200}
              rows={2}
            />
            {errors.descripcion_breve && (
              <p className="text-sm text-red-600 mt-1">{errors.descripcion_breve.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descripcion_larga">Descripción Detallada *</Label>
            <Textarea
              id="descripcion_larga"
              {...register('descripcion_larga')}
              placeholder="Describe tu startup en detalle: misión, servicios, tecnologías..."
              rows={6}
            />
            {errors.descripcion_larga && (
              <p className="text-sm text-red-600 mt-1">{errors.descripcion_larga.message}</p>
            )}
          </div>

          <div>
            <Label>Sectores / Tags (máx. 5)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AVAILABLE_SECTORS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                >
                  {tag}
                </button>
              ))}
            </div>
            {errors.tags && (
              <p className="text-sm text-red-600 mt-1">{errors.tags.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Detalles de la Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Empresa</CardTitle>
          <CardDescription>Información sobre el tamaño y ubicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ubicacion">Ubicación *</Label>
            <Input
              id="ubicacion"
              {...register('ubicacion')}
              placeholder="Ej: Zaragoza, Huesca, Teruel..."
            />
            {errors.ubicacion && (
              <p className="text-sm text-red-600 mt-1">{errors.ubicacion.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="año_fundacion">Año de Fundación</Label>
            <Input
              id="año_fundacion"
              type="number"
              {...register('año_fundacion', { valueAsNumber: true })}
              placeholder={`Ej: ${new Date().getFullYear() - 2}`}
              min={1900}
              max={new Date().getFullYear() + 1}
            />
            {errors.año_fundacion && (
              <p className="text-sm text-red-600 mt-1">{errors.año_fundacion.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="num_empleados">Número de Empleados</Label>
            <Select
              value={watch('num_empleados')}
              onValueChange={(value) => setValue('num_empleados', value, { shouldValidate: true, shouldDirty: true })}
            >
              <SelectTrigger>
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
            <Label htmlFor="estado">Estado de la Empresa</Label>
            <Select
              value={watch('estado')}
              onValueChange={(value) => setValue('estado', value as any, { shouldValidate: true, shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
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
        </CardContent>
      </Card>

      {/* Step 3: Contacto y Enlaces */}
      <Card>
        <CardHeader>
          <CardTitle>Contacto y Enlaces</CardTitle>
          <CardDescription>Información de contacto y redes sociales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="web">Sitio Web</Label>
            <Input
              id="web"
              type="url"
              {...register('web')}
              placeholder="https://tusitio.com"
            />
            {errors.web && (
              <p className="text-sm text-red-600 mt-1">{errors.web.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email de Contacto (Premium)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contacto@tusitio.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Visible solo para inversores registrados
            </p>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono de Contacto (Premium)</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+34 976 123 456"
            />
            <p className="text-xs text-gray-500 mt-1">
              Visible solo para inversores registrados
            </p>
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Redes Sociales</Label>

            <div>
              <Input
                {...register('redes_sociales.linkedin')}
                placeholder="LinkedIn: https://linkedin.com/company/..."
                type="url"
              />
            </div>

            <div>
              <Input
                {...register('redes_sociales.twitter')}
                placeholder="Twitter: https://twitter.com/..."
                type="url"
              />
            </div>

            <div>
              <Input
                {...register('redes_sociales.facebook')}
                placeholder="Facebook: https://facebook.com/..."
                type="url"
              />
            </div>

            <div>
              <Input
                {...register('redes_sociales.instagram')}
                placeholder="Instagram: https://instagram.com/..."
                type="url"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Financiación */}
      <Card>
        <CardHeader>
          <CardTitle>Financiación</CardTitle>
          <CardDescription>Información sobre inversión recibida</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="inversion_recibida">Inversión Recibida</Label>
            <Select
              value={watch('inversion_recibida')}
              onValueChange={(value) => setValue('inversion_recibida', value, { shouldValidate: true, shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rango" />
              </SelectTrigger>
              <SelectContent>
                {FUNDING_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
