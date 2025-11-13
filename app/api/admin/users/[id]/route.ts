import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/admin/users/[id] - Update user metadata (role)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: userId } = await params

    // Verify admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden gestionar usuarios' }, { status: 403 })
    }

    // Get update data
    const body = await request.json()
    const { role, full_name } = body

    // Validate role
    const validRoles = ['entrepreneur', 'investor', 'admin']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido. Debe ser: entrepreneur, investor o admin' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Prevent admin from demoting themselves
    if (userId === user.id && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'No puedes cambiar tu propio rol de administrador' },
        { status: 400 }
      )
    }

    // Prepare updated metadata
    const updatedMetadata = {
      ...existingUser.user.user_metadata,
      ...(role && { role }),
      ...(full_name && { full_name }),
    }

    // Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMetadata,
      }
    )

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Usuario actualizado correctamente',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user (soft delete by setting metadata flag)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: userId } = await params

    // Verify admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar usuarios' }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta de administrador' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Delete user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 })
    }

    // Note: Related records in startup_owners will be handled by database CASCADE rules

    return NextResponse.json({
      message: 'Usuario eliminado correctamente',
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
