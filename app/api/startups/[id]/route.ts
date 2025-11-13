import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/startups/[id]
 * Allows approved startup owners to update their startup information
 */
export async function PATCH(
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

    // Check if startup exists
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

    // Check if user owns this startup (approved ownership)
    const { data: ownership, error: ownershipError } = await supabase
      .from('startup_owners')
      .select('id, approved')
      .eq('user_id', user.id)
      .eq('startup_id', id)
      .eq('approved', true)
      .maybeSingle()

    if (ownershipError) {
      console.error('Error checking ownership:', ownershipError)
      return NextResponse.json(
        { error: 'Error al verificar la propiedad' },
        { status: 500 }
      )
    }

    if (!ownership) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta startup. Debes ser el propietario aprobado.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate and sanitize update data
    const allowedFields = [
      'nombre',
      'descripcion_breve',
      'descripcion_larga',
      'logo_url',
      'año_fundacion',
      'estado',
      'ubicacion',
      'tags',
      'num_empleados',
      'web',
      'email',
      'phone',
      'redes_sociales',
      'inversion_recibida',
      'pitch_deck_url',
    ]

    const updateData: any = {}

    // Only include allowed fields that are present in the request
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Ensure slug is regenerated if nombre changes
    if (updateData.nombre && updateData.nombre !== startup.nombre) {
      updateData.slug = updateData.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Validate required fields if they're being updated
    if (updateData.nombre !== undefined && !updateData.nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    if (updateData.descripcion_breve !== undefined && !updateData.descripcion_breve) {
      return NextResponse.json(
        { error: 'La descripción breve es obligatoria' },
        { status: 400 }
      )
    }

    if (updateData.descripcion_larga !== undefined && !updateData.descripcion_larga) {
      return NextResponse.json(
        { error: 'La descripción larga es obligatoria' },
        { status: 400 }
      )
    }

    if (updateData.ubicacion !== undefined && !updateData.ubicacion) {
      return NextResponse.json(
        { error: 'La ubicación es obligatoria' },
        { status: 400 }
      )
    }

    // Validate year if provided
    if (updateData.año_fundacion !== undefined) {
      const currentYear = new Date().getFullYear()
      if (updateData.año_fundacion < 1900 || updateData.año_fundacion > currentYear + 1) {
        return NextResponse.json(
          { error: 'El año de fundación debe estar entre 1900 y el año actual' },
          { status: 400 }
        )
      }
    }

    // Validate tags array if provided
    if (updateData.tags !== undefined && !Array.isArray(updateData.tags)) {
      return NextResponse.json(
        { error: 'Los tags deben ser un array' },
        { status: 400 }
      )
    }

    // Validate social media object if provided
    if (updateData.redes_sociales !== undefined && typeof updateData.redes_sociales !== 'object') {
      return NextResponse.json(
        { error: 'Las redes sociales deben ser un objeto' },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Owners can update without re-approval (is_approved remains true)
    // This is intentional - owners can update their approved startups

    // Update the startup
    const { data: updatedStartup, error: updateError } = await supabase
      .from('startups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating startup:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la startup' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        startup: updatedStartup,
        message: 'Startup actualizada correctamente'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in update startup API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
