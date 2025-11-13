import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/startups/[id]/claim
 * Allows authenticated entrepreneurs to claim ownership of a startup
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Check if user is entrepreneur
    const userRole = user.user_metadata?.role
    if (userRole !== 'entrepreneur') {
      return NextResponse.json(
        { error: 'Solo emprendedores pueden reclamar startups' },
        { status: 403 }
      )
    }

    // Check if startup exists and is approved
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('id, nombre, is_approved')
      .eq('id', id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json(
        { error: 'Startup no encontrada' },
        { status: 404 }
      )
    }

    if (!startup.is_approved) {
      return NextResponse.json(
        { error: 'Solo se pueden reclamar startups aprobadas' },
        { status: 400 }
      )
    }

    // Check if startup is already claimed and approved
    const { data: existingClaims, error: claimsError } = await supabase
      .from('startup_owners')
      .select('id, user_id, approved')
      .eq('startup_id', id)

    if (claimsError) {
      console.error('Error checking existing claims:', claimsError)
      return NextResponse.json(
        { error: 'Error al verificar reclamaciones existentes' },
        { status: 500 }
      )
    }

    // Check if an approved owner already exists
    const approvedOwner = existingClaims?.find(claim => claim.approved === true)
    if (approvedOwner) {
      return NextResponse.json(
        { error: 'Esta startup ya tiene un propietario aprobado' },
        { status: 400 }
      )
    }

    // Check if this user has already claimed this startup
    const userExistingClaim = existingClaims?.find(claim => claim.user_id === user.id)
    if (userExistingClaim) {
      return NextResponse.json(
        {
          error: 'Ya has reclamado esta startup',
          claim: {
            id: userExistingClaim.id,
            approved: userExistingClaim.approved,
            status: userExistingClaim.approved ? 'approved' : 'pending'
          }
        },
        { status: 400 }
      )
    }

    // Create ownership claim
    const { data: claim, error: insertError } = await supabase
      .from('startup_owners')
      .insert({
        user_id: user.id,
        startup_id: id,
        approved: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating claim:', insertError)
      return NextResponse.json(
        { error: 'Error al crear la reclamación' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to admin
    // This would require email service integration (Resend/SendGrid)
    // Email should include: startup name, user email, link to admin review page

    return NextResponse.json(
      {
        success: true,
        claim: {
          id: claim.id,
          startup_id: claim.startup_id,
          approved: claim.approved,
          created_at: claim.created_at,
          status: 'pending'
        },
        message: 'Reclamación enviada correctamente. Recibirás una notificación cuando sea revisada.'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in claim API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
