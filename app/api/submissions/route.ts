import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseService = createServiceClient() // For storage uploads

    // Parse form data
    const formData = await request.formData()

    // Extract form fields
    const nombre = formData.get('nombre') as string
    const descripcion_breve = formData.get('descripcion_breve') as string
    const descripcion_larga = formData.get('descripcion_larga') as string
    const ano_fundacion = parseInt(formData.get('año_fundacion') as string)
    const ubicacion = formData.get('ubicacion') as string
    const tags = JSON.parse(formData.get('tags') as string)
    const num_empleados = formData.get('num_empleados') as string || null
    const estado = formData.get('estado') as string
    const web = formData.get('web') as string || null
    const email = formData.get('email') as string || null
    const phone = formData.get('phone') as string || null
    const redes_sociales = JSON.parse(formData.get('redes_sociales') as string || '{}')
    const inversion_recibida = formData.get('inversion_recibida') as string || null
    const submitter_email = formData.get('submitter_email') as string

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
      const logoPath = `submissions/${Date.now()}-${slug}.${logoExt}`

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
      const pitchPath = `submissions/${Date.now()}-${slug}-pitch.pdf`

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

    // Insert submission into database
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        nombre,
        slug,
        descripcion_breve,
        descripcion_larga,
        logo_url,
        ano_fundacion,
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
        submitter_email,
        status: 'pending',
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Submission insert error:', submissionError)
      throw new Error('Error al guardar la solicitud')
    }

    // TODO: Send email notification to admin
    // This can be implemented with a service like Resend, SendGrid, or Supabase Edge Functions

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud enviada con éxito',
        submission,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error al procesar la solicitud',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'pending' | 'approved' | 'rejected'

    let query = supabase.from('submissions').select('*').order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: submissions, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ submissions }, { status: 200 })
  } catch (error) {
    console.error('Fetch submissions error:', error)
    return NextResponse.json(
      { error: 'Error al obtener las solicitudes' },
      { status: 500 }
    )
  }
}
