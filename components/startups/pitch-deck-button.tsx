'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface PitchDeckButtonProps {
  startupId: string
  startupName: string
}

export function PitchDeckButton({ startupId, startupName }: PitchDeckButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      const response = await fetch(`/api/startups/${startupId}/pitch-deck`)

      if (!response.ok) {
        throw new Error('Error al descargar el pitch deck')
      }

      // Get the blob
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${startupName}-pitch-deck.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading pitch deck:', error)
      alert('Error al descargar el pitch deck. Por favor, inténtalo de nuevo.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      className="w-full gap-2"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Descargando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Descargar Pitch Deck
        </>
      )}
    </Button>
  )
}
