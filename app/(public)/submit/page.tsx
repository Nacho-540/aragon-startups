'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/submissions/file-upload'
import {
  submissionFormSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  AVAILABLE_SECTORS,
  EMPLOYEE_RANGES,
  COMPANY_STATES,
  type SubmissionFormValues,
} from '@/lib/validations/submission'

const STEPS = [
  { number: 1, title: 'Información Básica', schema: step1Schema },
  { number: 2, title: 'Detalles de la Empresa', schema: step2Schema },
  { number: 3, title: 'Contacto y Enlaces', schema: step3Schema },
  { number: 4, title: 'Financiación y Pitch', schema: step4Schema },
  { number: 5, title: 'Email del Solicitante', schema: step5Schema },
]

const AUTOSAVE_KEY = 'startup-submission-draft'

export default function SubmitPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
    reset,
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
    },
    mode: 'onBlur',
  })

  const formValues = watch()

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        reset(draft)
        if (draft.tags) {
          setSelectedTags(draft.tags)
        }
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [reset])

  // Autosave to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formValues))
    }, 1000)

    return () => clearTimeout(saveTimer)
  }, [formValues])

  const handleNext = async () => {
    const currentStepSchema = STEPS[currentStep - 1].schema
    const isValid = await trigger(Object.keys(currentStepSchema.shape) as any)

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag].slice(0, 5) // Max 5 tags

    setSelectedTags(newTags)
    setValue('tags', newTags, { shouldValidate: true })
  }

  const onSubmit = async (data: SubmissionFormValues) => {
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

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al enviar la solicitud')
      }

      // Clear saved draft
      localStorage.removeItem(AUTOSAVE_KEY)

      // Show success message and redirect
      alert('¡Solicitud enviada con éxito! Revisaremos tu startup y te contactaremos pronto.')
      router.push('/')
    } catch (error) {
      console.error('Submission error:', error)
      alert(error instanceof Error ? error.message : 'Error al enviar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Añade tu Startup
          </h1>
          <p className="text-gray-600">
            Completa el formulario para aparecer en el directorio de startups de Aragón
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      ${
                        currentStep > step.number
                          ? 'bg-green-500 border-green-500 text-white'
                          : currentStep === step.number
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-500'
                      }
                    `}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        h-0.5 flex-1 mx-2
                        ${
                          currentStep > step.number
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }
                      `}
                    />
                  )}
                </div>
                <p className="text-xs text-center mt-2 text-gray-600 hidden sm:block">
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información Básica
                </h2>

                <div>
                  <Label htmlFor="nombre">Nombre de la Startup *</Label>
                  <Input
                    id="nombre"
                    {...register('nombre')}
                    placeholder="Ej: TechVenture"
                    className="mt-1"
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
                    placeholder="Una frase que resuma tu startup"
                    rows={2}
                    className="mt-1"
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
                    placeholder="Describe tu startup, qué problema resuelve, tu propuesta de valor..."
                    rows={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {watch('descripcion_larga')?.length || 0} / 2000 caracteres
                  </p>
                  {errors.descripcion_larga && (
                    <p className="text-sm text-red-600 mt-1">{errors.descripcion_larga.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Detalles de la Empresa
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="año_fundacion">Año de Fundación *</Label>
                    <Input
                      id="año_fundacion"
                      type="number"
                      {...register('año_fundacion', { valueAsNumber: true })}
                      placeholder={String(new Date().getFullYear())}
                      className="mt-1"
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
                      className="mt-1"
                    />
                    {errors.ubicacion && (
                      <p className="text-sm text-red-600 mt-1">{errors.ubicacion.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Sectores * (Selecciona 1-5)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
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
            )}

            {/* Step 3: Contact & Links */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contacto y Enlaces
                </h2>

                <div>
                  <Label htmlFor="web">Sitio Web</Label>
                  <Input
                    id="web"
                    type="url"
                    {...register('web')}
                    placeholder="https://example.com"
                    className="mt-1"
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
                      className="mt-1"
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
                      className="mt-1"
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
                    />
                    <Input
                      {...register('redes_sociales.twitter')}
                      placeholder="Twitter/X URL"
                    />
                    <Input
                      {...register('redes_sociales.facebook')}
                      placeholder="Facebook URL"
                    />
                    <Input
                      {...register('redes_sociales.instagram')}
                      placeholder="Instagram URL"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Funding & Pitch */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Financiación y Materiales
                </h2>

                <div>
                  <Label htmlFor="inversion_recibida">Inversión Recibida (Opcional)</Label>
                  <Input
                    id="inversion_recibida"
                    {...register('inversion_recibida')}
                    placeholder="Ej: €500K Seed Round"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes incluir ronda, inversores, etc.
                  </p>
                </div>

                <FileUpload
                  accept=".png,.jpg,.jpeg,.svg"
                  maxSize={5 * 1024 * 1024} // 5MB
                  label="Logo de la Startup"
                  description="PNG, JPG, JPEG o SVG - Máximo 5MB"
                  onFileSelect={(file) => setValue('logo_file', file)}
                  value={watch('logo_file') as File}
                  preview
                />

                <FileUpload
                  accept=".pdf"
                  maxSize={10 * 1024 * 1024} // 10MB
                  label="Pitch Deck (Opcional)"
                  description="PDF - Máximo 10MB (solo visible para inversores registrados)"
                  onFileSelect={(file) => setValue('pitch_deck_file', file)}
                  value={watch('pitch_deck_file') as File}
                  preview={false}
                />
              </div>
            )}

            {/* Step 5: Submitter Email */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Confirma tu Email
                </h2>

                <div>
                  <Label htmlFor="submitter_email">Tu Email *</Label>
                  <Input
                    id="submitter_email"
                    type="email"
                    {...register('submitter_email')}
                    placeholder="tu@email.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Te contactaremos a este email cuando revisemos tu solicitud
                  </p>
                  {errors.submitter_email && (
                    <p className="text-sm text-red-600 mt-1">{errors.submitter_email.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Revisa tu información antes de enviar
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Todos los datos son correctos</li>
                    <li>• El logo y el pitch deck (si aplica) están subidos</li>
                    <li>• El email de contacto es válido</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Autosave Indicator */}
        <p className="text-center text-sm text-gray-500 mt-4">
          ✓ Tu progreso se guarda automáticamente
        </p>
      </div>
    </div>
  )
}
