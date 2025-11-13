import { NextRequest, NextResponse } from 'next/server'
import { getPitchDeckUrl } from '@/lib/api/startups'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { url, error } = await getPitchDeckUrl(id)

    if (error) {
      return NextResponse.json(
        { error },
        { status: error === 'Acceso no autorizado' ? 403 : 404 }
      )
    }

    if (!url) {
      return NextResponse.json(
        { error: 'Pitch deck no encontrado' },
        { status: 404 }
      )
    }

    // Redirect to signed URL
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error in pitch deck API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
