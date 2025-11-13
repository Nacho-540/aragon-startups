import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseService = createServiceClient() // For storage uploads

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()

    // Extract form fields
    const nombre = formData.get('nombre') as string
    const descripcion_breve = formData.get('descripcion_breve') as string
    const descripcion_larga = formData.get('descripcion_larga') as string
    const año_fundacion = parseInt(formData.get('año_fundacion') as string)
    const ubicacion = formData.get('ubicacion') as string
    const tags = JSON.parse(formData.get('tags') as string)
    const num_empleados = formData.get('num_empleados') as string || null
    const estado = formData.get('estado') as string
    const web = formData.get('web') as string || null
    const email = formData.get('email') as string || null
    const phone = formData.get('phone') as string || null
    const redes_sociales = JSON.parse(formData.get('redes_sociales') as string || '{}')
    const inversion_recibida = formData.get('inversion_recibida') as string || null

    // Get uploaded files
    const logoFile = formData.get('logo') as File | null
    const pitchDeckFile = formData.get('pitch_deck') as File | null

    // Generate slug from name
    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    let logo_url: string | null = null
    let pitch_deck_url: string | null = null

    // Upload logo if provided
    if (logoFile) {
      const logoExt = logoFile.name.split('.').pop()
      const logoPath = `startups/${Date.now()}-${slug}.${logoExt}`

      const { error: logoError } = await supabaseService.storage
        .from('startup-logos')
        .upload(logoPath, logoFile, {
          contentType: logoFile.type,
          upsert: false,
        })

      if (logoError) {
        console.error('Logo upload error:', logoError)
        throw new Error('Error al subir el logo')
      }

      const { data: logoData } = supabaseService.storage
        .from('startup-logos')
        .getPublicUrl(logoPath)

      logo_url = logoData.publicUrl
    }

    // Upload pitch deck if provided
    if (pitchDeckFile) {
      const pitchPath = `startups/${Date.now()}-${slug}-pitch.pdf`

      const { error: pitchError } = await supabaseService.storage
        .from('pitch-decks')
        .upload(pitchPath, pitchDeckFile, {
          contentType: pitchDeckFile.type,
          upsert: false,
        })

      if (pitchError) {
        console.error('Pitch deck upload error:', pitchError)
        throw new Error('Error al subir el pitch deck')
      }

      const { data: pitchData } = supabaseService.storage
        .from('pitch-decks')
        .getPublicUrl(pitchPath)

      pitch_deck_url = pitchData.publicUrl
    }

    // Create startup directly (bypass submission queue)
    const { data: startup, error: createError } = await supabase
      .from('startups')
      .insert({
        nombre,
        slug,
        descripcion_breve,
        descripcion_larga,
        logo_url,
        año_fundacion,
        estado,
        ubicacion,
        tags,
        num_empleados,
        web: web || null,
        email: email || null,
        phone: phone || null,
        redes_sociales,
        inversion_recibida: inversion_recibida || null,
        pitch_deck_url,
        is_approved: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Startup creation error:', createError)
      throw new Error('Error al crear la startup')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Startup creada con éxito',
        startup,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create startup error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear la startup',
      },
      { status: 500 }
    )
  }
}
