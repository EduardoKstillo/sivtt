import { useState } from 'react'
import { Button } from '@components/ui/button'
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ImageViewer = ({ url, alt }) => {
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={cn(
      "h-full flex flex-col",
      isFullscreen && "fixed inset-0 z-50 bg-black"
    )}>
      {/* Controls */}
      <div className={cn(
        "flex items-center justify-center gap-2 p-2 border-b",
        isFullscreen ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-200"
      )}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className={isFullscreen && "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className={cn(
          "text-sm min-w-[60px] text-center",
          isFullscreen ? "text-white" : "text-gray-600"
        )}>
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className={isFullscreen && "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          className={isFullscreen && "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className={isFullscreen && "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Container */}
      <div className={cn(
        "flex-1 overflow-auto flex items-center justify-center p-4",
        isFullscreen ? "bg-black" : "bg-gray-50"
      )}>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          <img
            src={url}
            alt={alt}
            className="max-w-full h-auto"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-out'
            }}
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  )
}