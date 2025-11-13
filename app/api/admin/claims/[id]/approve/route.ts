import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/admin/claims/[id]/approve
 * Allows admins to approve ownership claims
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden aprobar reclamaciones.' },
        { status: 403 }
      )
    }

    // Get claim details
    const { data: claim, error: claimError } = await supabase
      .from('startup_owners')
      .select(`
        id,
        user_id,
        startup_id,
        approved,
        created_at,
        startups (
          id,
          nombre,
          slug
        )
      `)
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      console.error('Error fetching claim:', claimError)
      return NextResponse.json(
        { error: 'Reclamación no encontrada' },
        { status: 404 }
      )
    }

    // Check if claim is already approved
    if (claim.approved) {
      return NextResponse.json(
        { error: 'Esta reclamación ya fue aprobada' },
        { status: 400 }
      )
    }

    // Check if there's already an approved owner for this startup
    const { data: existingApproved, error: existingError } = await supabase
      .from('startup_owners')
      .select('id, user_id')
      .eq('startup_id', claim.startup_id)
      .eq('approved', true)

    if (existingError) {
      console.error('Error checking existing owners:', existingError)
      return NextResponse.json(
        { error: 'Error al verificar propietarios existentes' },
        { status: 500 }
      )
    }

    if (existingApproved && existingApproved.length > 0) {
      return NextResponse.json(
        { error: 'Esta startup ya tiene un propietario aprobado' },
        { status: 400 }
      )
    }

    // Approve the claim
    const { data: approvedClaim, error: updateError } = await supabase
      .from('startup_owners')
      .update({ approved: true })
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      console.error('Error approving claim:', updateError)
      return NextResponse.json(
        { error: 'Error al aprobar la reclamación' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to user
    // This would require email service integration (Resend/SendGrid)
    // Email should include: startup name, approval confirmation, link to edit page

    return NextResponse.json(
      {
        success: true,
        claim: {
          id: approvedClaim.id,
          user_id: approvedClaim.user_id,
          startup_id: approvedClaim.startup_id,
          approved: approvedClaim.approved,
          created_at: approvedClaim.created_at
        },
        message: 'Reclamación aprobada correctamente'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in approve claim API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/claims/[id]/approve
 * Allows admins to reject/delete ownership claims
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden rechazar reclamaciones.' },
        { status: 403 }
      )
    }

    // Get claim details before deleting (for email notification)
    const { data: claim, error: claimError } = await supabase
      .from('startup_owners')
      .select(`
        id,
        user_id,
        startup_id,
        startups (
          nombre
        )
      `)
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Reclamación no encontrada' },
        { status: 404 }
      )
    }

    // Delete the claim
    const { error: deleteError } = await supabase
      .from('startup_owners')
      .delete()
      .eq('id', claimId)

    if (deleteError) {
      console.error('Error rejecting claim:', deleteError)
      return NextResponse.json(
        { error: 'Error al rechazar la reclamación' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to user
    // This would require email service integration (Resend/SendGrid)
    // Email should include: startup name, rejection reason (optional), contact admin email

    return NextResponse.json(
      {
        success: true,
        message: 'Reclamación rechazada correctamente'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in reject claim API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
