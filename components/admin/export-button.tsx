'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const response = await fetch('/api/admin/startups/export')

      if (!response.ok) {
        throw new Error('Error al exportar las startups')
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `startups_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Error al exportar las startups')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? 'Exportando...' : 'Exportar CSV'}
    </Button>
  )
}
