import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Upload, Loader2, File, X, Info } from 'lucide-react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Mapeo de extensión → tipo de evidencia
 * (Ayuda visual + fallback backend)
 */
const EXTENSION_TIPOS = {
  pdf: 'DOCUMENTO',
  doc: 'DOCUMENTO',
  docx: 'DOCUMENTO',
  txt: 'DOCUMENTO',
  xlsx: 'DOCUMENTO',

  jpg: 'IMAGEN',
  jpeg: 'IMAGEN',
  png: 'IMAGEN',

  mp4: 'VIDEO',
  avi: 'VIDEO',

  ppt: 'PRESENTACION',
  pptx: 'PRESENTACION'
}

export const SubirEvidenciaModal = ({
  open,
  onOpenChange,
  actividad,
  onSuccess
}) => {
  const [requisitoId, setRequisitoId] = useState('extra')
const [file, setFile] = useState(null)
const [loading, setLoading] = useState(false)
const [dragActive, setDragActive] = useState(false)

  // Seguridad por si actividad o requisitos vienen undefined
  const requisitos = actividad?.requisitos || []

  /**
   * Reset de estado cada vez que se abre el modal
   */
  useEffect(() => {
    if (open) {
      setFile(null)
      setRequisitoId('extra')
    }
  }, [open])

  /**
   * Validación y carga del archivo
   */
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'Archivo muy pesado',
        description: 'El tamaño máximo permitido es 10MB'
      })
      return
    }

    setFile(selectedFile)
  }

  /**
   * Drag & Drop handlers
   */
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  /**
   * Submit principal
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)

    try {
      const formData = new FormData()

      /**
       * 1️⃣ Requisito
       * El backend espera:
       *   - int → requisito vinculado
       *   - null → archivo extra
       *
       * Nota backend:
       * const requisitoId = req.body.requisitoId
       *   ? parseInt(req.body.requisitoId)
       *   : null
       */
      if (requisitoId && requisitoId !== 'extra') {
        formData.append('requisitoId', requisitoId)
      }

      /**
       * 2️⃣ Metadatos del archivo
       */
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const tipoEvidencia = EXTENSION_TIPOS[ext] || 'OTRO'

      formData.append('tipoEvidencia', tipoEvidencia)
      formData.append('nombreArchivo', file.name)

      /**
       * 3️⃣ Archivo (SIEMPRE al final para Multer)
       */
      formData.append('archivo', file)

      await evidenciasAPI.upload(actividad.id, formData)

      toast({
        title: 'Evidencia subida',
        description: 'Se ha generado una nueva versión del entregable.'
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Error al subir evidencia',
        description: err.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subir Evidencia</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-xs">
              Vincula el archivo a un entregable para mantener el historial de versiones ordenado.
            </AlertDescription>
          </Alert>

          {/* Requisito */}
          <div className="space-y-2">
            <Label>Entregable vinculado</Label>
            <Select
              value={requisitoId}
              onValueChange={setRequisitoId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {requisitos.length > 0 ? (
                  requisitos.map(req => (
                    <SelectItem
                      key={req.id}
                      value={req.id.toString()}
                    >
                      {req.obligatorio ? '🔴 ' : '⚪ '}
                      {req.nombre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No hay entregables definidos
                  </SelectItem>
                )}
                <SelectItem value="extra">📎 Archivo adicional / Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <Label>Archivo</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:bg-gray-50'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div className="text-sm text-gray-600">
                    Arrastra o{' '}
                    <label className="text-blue-600 hover:underline cursor-pointer">
                      selecciona
                      <input
                        type="file"
                        className="hidden"
                        disabled={loading}
                        onChange={(e) =>
                          handleFileChange(e.target.files?.[0])
                        }
                      />
                    </label>{' '}
                    un archivo
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !file}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Subir Archivo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
