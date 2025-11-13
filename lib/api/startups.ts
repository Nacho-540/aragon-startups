import { createClient } from '@/lib/supabase/server'
import { createSimpleClient } from '@/lib/supabase/server-simple'
import type { Startup } from '@/types/startup'

export interface StartupFilters {
  query?: string
  location?: string
  tags?: string[]
  yearFrom?: number
  yearTo?: number
  employees?: string
}

/**
 * Fetch approved startups for public view
 * Only returns public fields for non-authenticated or non-investor users
 */
export async function getApprovedStartups(
  page: number = 1,
  limit: number = 20,
  filters?: StartupFilters
): Promise<{ data: Startup[]; count: number; error: string | null }> {
  try {
    // Use simple client for public data (no auth required)
    const supabase = createSimpleClient()

    // Start query
    let query = supabase
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.query) {
      // Full-text search on name and description
      query = query.or(`nombre.ilike.%${filters.query}%,descripcion_breve.ilike.%${filters.query}%,descripcion_larga.ilike.%${filters.query}%`)
    }

    if (filters?.location) {
      query = query.ilike('ubicacion', `%${filters.location}%`)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters?.yearFrom) {
      query = query.gte('año_fundacion', filters.yearFrom)
    }

    if (filters?.yearTo) {
      query = query.lte('año_fundacion', filters.yearTo)
    }

    if (filters?.employees) {
      query = query.eq('num_empleados', filters.employees)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching startups:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return {
        data: [],
        count: 0,
        error: `Error de base de datos: ${error.message || 'Error desconocido'}. Código: ${error.code || 'N/A'}`
      }
    }

    return { data: data || [], count: count || 0, error: null }
  } catch (error) {
    console.error('Unexpected error fetching startups:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado'
    return { data: [], count: 0, error: `Error al cargar startups: ${errorMessage}` }
  }
}

/**
 * Fetch a single startup by slug
 * Returns premium fields only for authenticated investors
 */
export async function getStartupBySlug(
  slug: string
): Promise<{ data: Startup | null; error: string | null; isPremiumVisible: boolean }> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is investor
    const isInvestor = user?.user_metadata?.role === 'investor'

    // Fetch startup
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('slug', slug)
      .eq('is_approved', true)
      .single()

    if (error) {
      console.error('Error fetching startup:', error)
      return { data: null, error: error.message, isPremiumVisible: false }
    }

    // If not investor, hide premium fields
    if (!isInvestor && data) {
      const publicData: Partial<Startup> = { ...data }
      delete publicData.email
      delete publicData.phone
      delete publicData.pitch_deck_url
      return { data: publicData as Startup, error: null, isPremiumVisible: false }
    }

    return { data, error: null, isPremiumVisible: isInvestor }
  } catch (error) {
    console.error('Unexpected error fetching startup:', error)
    return { data: null, error: 'Error inesperado al cargar la startup', isPremiumVisible: false }
  }
}

/**
 * Get featured startups for homepage (latest 6)
 */
export async function getFeaturedStartups(): Promise<{ data: Startup[]; error: string | null }> {
  try {
    // Use simple client for public data (no auth required)
    const supabase = createSimpleClient()

    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching featured startups:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error fetching featured startups:', error)
    return { data: [], error: 'Error inesperado al cargar startups destacadas' }
  }
}

/**
 * Get startups count and statistics
 */
export async function getStartupStats(): Promise<{
  totalStartups: number
  totalCities: number
  totalIndustries: number
  error: string | null
}> {
  try {
    // Use simple client for public data (no auth required)
    const supabase = createSimpleClient()

    // Get total startups
    const { count: totalStartups } = await supabase
      .from('startups')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)

    // Get unique cities
    const { data: locationData } = await supabase
      .from('startups')
      .select('ubicacion')
      .eq('is_approved', true)

    const uniqueCities = locationData
      ? new Set(locationData.map(s => s.ubicacion)).size
      : 0

    // Get unique industries (tags)
    const { data: tagsData } = await supabase
      .from('startups')
      .select('tags')
      .eq('is_approved', true)

    const allTags = tagsData?.flatMap(s => s.tags || []) || []
    const uniqueIndustries = new Set(allTags).size

    return {
      totalStartups: totalStartups || 0,
      totalCities: uniqueCities,
      totalIndustries: uniqueIndustries,
      error: null
    }
  } catch (error) {
    console.error('Unexpected error fetching stats:', error)
    return {
      totalStartups: 0,
      totalCities: 0,
      totalIndustries: 0,
      error: 'Error al cargar estadísticas'
    }
  }
}

/**
 * Get available filter options
 */
export async function getFilterOptions(): Promise<{
  locations: string[]
  tags: string[]
  years: { min: number; max: number }
  error: string | null
}> {
  try {
    // Use simple client for public data (no auth required)
    const supabase = createSimpleClient()

    // Get unique locations
    const { data: locationData } = await supabase
      .from('startups')
      .select('ubicacion')
      .eq('is_approved', true)
      .not('ubicacion', 'is', null)

    const locations = locationData
      ? Array.from(new Set(locationData.map(s => s.ubicacion))).sort()
      : []

    // Get all tags
    const { data: tagsData } = await supabase
      .from('startups')
      .select('tags')
      .eq('is_approved', true)

    const allTags = tagsData?.flatMap(s => s.tags || []) || []
    const tags = Array.from(new Set(allTags)).sort()

    // Get year range
    const { data: yearData } = await supabase
      .from('startups')
      .select('*')
      .eq('is_approved', true)
      .not('año_fundacion', 'is', null)
      .order('año_fundacion', { ascending: true })

    const years = yearData?.map((s: any) => s.año_fundacion) || []
    const min = years.length > 0 ? Math.min(...years) : new Date().getFullYear()
    const max = years.length > 0 ? Math.max(...years) : new Date().getFullYear()

    return {
      locations,
      tags,
      years: { min, max },
      error: null
    }
  } catch (error) {
    console.error('Unexpected error fetching filter options:', error)
    return {
      locations: [],
      tags: [],
      years: { min: 2000, max: new Date().getFullYear() },
      error: 'Error al cargar opciones de filtro'
    }
  }
}

/**
 * Get pitch deck signed URL for investors
 */
export async function getPitchDeckUrl(startupId: string): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Check if user is investor
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== 'investor') {
      return { url: null, error: 'Acceso no autorizado' }
    }

    // Get startup pitch deck path
    const { data: startup } = await supabase
      .from('startups')
      .select('pitch_deck_url')
      .eq('id', startupId)
      .single()

    if (!startup?.pitch_deck_url) {
      return { url: null, error: 'Pitch deck no disponible' }
    }

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('pitch-decks')
      .createSignedUrl(startup.pitch_deck_url, 3600)

    if (error) {
      console.error('Error generating signed URL:', error)
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl, error: null }
  } catch (error) {
    console.error('Unexpected error getting pitch deck:', error)
    return { url: null, error: 'Error al obtener el pitch deck' }
  }
}
