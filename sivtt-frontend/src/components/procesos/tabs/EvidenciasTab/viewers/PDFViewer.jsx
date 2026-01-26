import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { ZoomIn, ZoomOut, RotateCw, Loader2, AlertCircle } from 'lucide-react'

export const PDFViewer = ({ url }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [scale, setScale] = useState(1)

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar el PDF. 
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              Abrir en nueva pestaña
            </a>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 border-b border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={scale >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        <iframe
          src={`${url}#view=FitH`}
          className="w-full h-full border-0"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          onLoad={handleLoad}
          onError={handleError}
          title="PDF Viewer"
        />
      </div>
    </div>
  )
}