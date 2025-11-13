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

    if (!admin_notes || !admin_notes.trim()) {
      return NextResponse.json(
        { error: 'Las notas del administrador son requeridas para rechazar' },
        { status: 400 }
      )
    }

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

    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        admin_notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la solicitud' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to submitter with rejection reason
    // This can be implemented with a service like Resend, SendGrid, or Supabase Edge Functions

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud rechazada con éxito',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Rejection error:', error)
    return NextResponse.json(
      { error: 'Error al rechazar la solicitud' },
      { status: 500 }
    )
  }
}
