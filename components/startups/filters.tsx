'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, X, Filter, Loader2 } from 'lucide-react'

interface FiltersProps {
  locations: string[]
  tags: string[]
  yearRange: { min: number; max: number }
  initialFilters?: {
    query?: string
    location?: string
    tags?: string[]
    yearFrom?: number
    yearTo?: number
    employees?: string
  }
}

const EMPLOYEE_RANGES = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '201-500', label: '201-500 empleados' },
  { value: '500+', label: '500+ empleados' }
]

export function Filters({ locations, tags, yearRange, initialFilters = {} }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Filter states
  const [query, setQuery] = useState(initialFilters.query || '')
  const [location, setLocation] = useState(initialFilters.location || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags || [])
  const [yearFrom, setYearFrom] = useState<string>(initialFilters.yearFrom?.toString() || '')
  const [yearTo, setYearTo] = useState<string>(initialFilters.yearTo?.toString() || '')
  const [employees, setEmployees] = useState(initialFilters.employees || '')
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (query) params.set('query', query)
    if (location) params.set('location', location)
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    if (yearFrom) params.set('yearFrom', yearFrom)
    if (yearTo) params.set('yearTo', yearTo)
    if (employees) params.set('employees', employees)

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setQuery('')
    setLocation('')
    setSelectedTags([])
    setYearFrom('')
    setYearTo('')
    setEmployees('')

    startTransition(() => {
      router.push(pathname)
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const hasActiveFilters = query || location || selectedTags.length > 0 || yearFrom || yearTo || employees

  return (
    <div className="space-y-4">
      {/* Search Bar - Always Visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar startups por nombre o descripción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {[location, selectedTags.length > 0, yearFrom || yearTo, employees].filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Advanced Filters - Collapsible */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Filter */}
            {locations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Select value={location || 'all'} onValueChange={(value) => {
                  setLocation(value === 'all' ? '' : value)
                  setTimeout(applyFilters, 0)
                }}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Todas las ubicaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label>Sectores / Tags</Label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        toggleTag(tag)
                        setTimeout(applyFilters, 0)
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTags.length} sector{selectedTags.length !== 1 ? 'es' : ''} seleccionado{selectedTags.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Year Range Filter */}
            <div className="space-y-2">
              <Label>Año de Fundación</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearFrom" className="text-xs text-muted-foreground">
                    Desde
                  </Label>
                  <Select value={yearFrom || 'any'} onValueChange={(value) => {
                    setYearFrom(value === 'any' ? '' : value)
                    setTimeout(applyFilters, 0)
                  }}>
                    <SelectTrigger id="yearFrom">
                      <SelectValue placeholder={yearRange.min.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquiera</SelectItem>
                      {Array.from(
                        { length: yearRange.max - yearRange.min + 1 },
                        (_, i) => yearRange.min + i
                      ).reverse().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearTo" className="text-xs text-muted-foreground">
                    Hasta
                  </Label>
                  <Select value={yearTo || 'any'} onValueChange={(value) => {
                    setYearTo(value === 'any' ? '' : value)
                    setTimeout(applyFilters, 0)
                  }}>
                    <SelectTrigger id="yearTo">
                      <SelectValue placeholder={yearRange.max.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquiera</SelectItem>
                      {Array.from(
                        { length: yearRange.max - yearRange.min + 1 },
                        (_, i) => yearRange.min + i
                      ).reverse().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Employee Count Filter */}
            <div className="space-y-2">
              <Label htmlFor="employees">Número de Empleados</Label>
              <Select value={employees || 'any'} onValueChange={(value) => {
                setEmployees(value === 'any' ? '' : value)
                setTimeout(applyFilters, 0)
              }}>
                <SelectTrigger id="employees">
                  <SelectValue placeholder="Cualquier tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquier tamaño</SelectItem>
                  {EMPLOYEE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply/Clear Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={applyFilters} className="flex-1">
                Aplicar Filtros
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Todo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          {query && (
            <span className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
              Búsqueda: "{query}"
              <button onClick={() => setQuery('')} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {location && (
            <span className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
              Ubicación: {location}
              <button onClick={() => {
                setLocation('')
                setTimeout(applyFilters, 0)
              }} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTags.length > 0 && (
            <span className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
              {selectedTags.length} sector{selectedTags.length !== 1 ? 'es' : ''}
              <button onClick={() => {
                setSelectedTags([])
                setTimeout(applyFilters, 0)
              }} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(yearFrom || yearTo) && (
            <span className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
              Año: {yearFrom || '...'} - {yearTo || '...'}
              <button onClick={() => {
                setYearFrom('')
                setYearTo('')
                setTimeout(applyFilters, 0)
              }} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {employees && (
            <span className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
              {EMPLOYEE_RANGES.find(r => r.value === employees)?.label}
              <button onClick={() => {
                setEmployees('')
                setTimeout(applyFilters, 0)
              }} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
