import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    const { admin_notes } = await request.json()

    // Get submission
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Check if startup with this slug already exists
    const { data: existingStartup } = await supabase
      .from('startups')
      .select('id, nombre')
      .eq('slug', submission.slug)
      .single()

    if (existingStartup) {
      return NextResponse.json(
        {
          error: `Ya existe una startup con este slug: "${submission.slug}". La startup "${existingStartup.nombre}" está usando este identificador.`,
          existingStartup
        },
        { status: 409 }
      )
    }

    // Create startup in startups table
    const { data: startup, error: createError } = await supabase
      .from('startups')
      .insert({
        nombre: submission.nombre,
        slug: submission.slug,
        descripcion_breve: submission.descripcion_breve,
        descripcion_larga: submission.descripcion_larga,
        logo_url: submission.logo_url,
        año_fundacion: submission.ano_fundacion,
        estado: submission.estado,
        ubicacion: submission.ubicacion,
        tags: submission.tags,
        num_empleados: submission.num_empleados,
        web: submission.web,
        email: submission.email,
        phone: submission.phone,
        redes_sociales: submission.redes_sociales,
        inversion_recibida: submission.inversion_recibida,
        pitch_deck_url: submission.pitch_deck_url,
        is_approved: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating startup:', createError)

      // Handle specific error codes
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe una startup con este slug. Por favor, modifica el nombre para generar un slug único.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Error al crear la startup: ' + createError.message },
        { status: 500 }
      )
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        admin_notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        approved_startup_id: startup.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      // Note: Startup was created, but submission update failed
      // This is acceptable - the startup exists which is the main goal
    }

    // TODO: Send email notification to submitter
    // This can be implemented with a service like Resend, SendGrid, or Supabase Edge Functions

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud aprobada con éxito',
        startup,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Error al aprobar la solicitud' },
      { status: 500 }
    )
  }
}
