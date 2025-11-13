import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    // Get all startups
    const { data: startups, error: startupsError } = await supabase
      .from('startups')
      .select('*')
      .order('created_at', { ascending: false })

    if (startupsError) {
      console.error('Error fetching startups:', startupsError)
      return NextResponse.json(
        { error: 'Error al obtener las startups' },
        { status: 500 }
      )
    }

    // Create CSV content
    const headers = [
      'ID',
      'Nombre',
      'Slug',
      'Descripción Breve',
      'Descripción Larga',
      'Logo URL',
      'Año Fundación',
      'Estado',
      'Ubicación',
      'Etiquetas',
      'Num Empleados',
      'Web',
      'Email',
      'Teléfono',
      'Inversión Recibida',
      'Pitch Deck URL',
      'Aprobada',
      'Creado Por',
      'Fecha Creación',
      'Fecha Actualización',
    ]

    const csvRows = [headers.join(',')]

    startups?.forEach((startup) => {
      const row = [
        startup.id,
        `"${startup.nombre?.replace(/"/g, '""') || ''}"`,
        startup.slug || '',
        `"${startup.descripcion_breve?.replace(/"/g, '""') || ''}"`,
        `"${startup.descripcion_larga?.replace(/"/g, '""') || ''}"`,
        startup.logo_url || '',
        startup.año_fundacion || '',
        startup.estado || '',
        `"${startup.ubicacion?.replace(/"/g, '""') || ''}"`,
        `"${startup.tags?.join('; ') || ''}"`,
        startup.num_empleados || '',
        startup.web || '',
        startup.email || '',
        startup.phone || '',
        startup.inversion_recibida || '',
        startup.pitch_deck_url || '',
        startup.is_approved ? 'Sí' : 'No',
        startup.created_by || '',
        startup.created_at || '',
        startup.updated_at || '',
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="startups_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/startups/export:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
