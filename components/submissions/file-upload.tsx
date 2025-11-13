'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  accept: string
  maxSize: number // in bytes
  label: string
  description?: string
  onFileSelect: (file: File | null) => void
  value?: File | null
  error?: string
  preview?: boolean
}

export function FileUpload({
  accept,
  maxSize,
  label,
  description,
  onFileSelect,
  value,
  error,
  preview = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    const acceptedTypes = accept.split(',').map(t => t.trim())
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const mimeType = file.type

    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type
      }
      return mimeType.startsWith(type.replace('*', ''))
    })

    if (!isValidType) {
      alert(`Tipo de archivo no válido. Formatos aceptados: ${accept}`)
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
      alert(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      return
    }

    // Set preview for images
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    onFileSelect(file)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 mb-3">{description}</p>
      )}

      {!value ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6
            transition-colors cursor-pointer
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${error ? 'border-red-300' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500">
              {accept} - Máximo {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          {previewUrl && preview ? (
            <div className="mb-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center mb-3">
              {value.type === 'application/pdf' ? (
                <FileText className="w-16 h-16 text-red-500" />
              ) : (
                <ImageIcon className="w-16 h-16 text-blue-500" />
              )}
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value.name}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {formatFileSize(value.size)}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="w-full mt-3"
          >
            Reemplazar archivo
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
