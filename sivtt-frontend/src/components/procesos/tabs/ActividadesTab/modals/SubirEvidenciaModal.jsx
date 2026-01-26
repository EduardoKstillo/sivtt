import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Upload, Loader2, File, X, Info } from 'lucide-react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const TIPOS_EVIDENCIA = [
  { value: 'DOCUMENTO', label: '📄 Documento' },
  { value: 'IMAGEN', label: '🖼️ Imagen' },
  { value: 'VIDEO', label: '🎥 Video' },
  { value: 'PRESENTACION', label: '📊 Presentación' },
  { value: 'INFORME', label: '📋 Informe' },
  { value: 'OTRO', label: '📎 Otro' }
]

const ALLOWED_EXTENSIONS = {
  DOCUMENTO: ['.pdf', '.doc', '.docx', '.txt'],
  IMAGEN: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  VIDEO: ['.mp4', '.avi', '.mov', '.wmv'],
  PRESENTACION: ['.ppt', '.pptx', '.odp'],
  INFORME: ['.pdf', '.doc', '.docx'],
  OTRO: []
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const SubirEvidenciaModal = ({ open, onOpenChange, actividad, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState('')
  const [file, setFile] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (selectedFile) => {
    setError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Validar tamaño
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar los 10MB')
      return
    }

    // Validar extensión si hay tipo seleccionado
    if (tipo && ALLOWED_EXTENSIONS[tipo].length > 0) {
      const extension = '.' + selectedFile.name.split('.').pop().toLowerCase()
      if (!ALLOWED_EXTENSIONS[tipo].includes(extension)) {
        setError(`Extensión no permitida para ${tipo}. Permitidas: ${ALLOWED_EXTENSIONS[tipo].join(', ')}`)
        return
      }
    }

    setFile(selectedFile)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!tipo) {
      toast({
        variant: "destructive",
        title: "Tipo requerido",
        description: "Debe seleccionar el tipo de evidencia"
      })
      return
    }

    if (!file) {
      toast({
        variant: "destructive",
        title: "Archivo requerido",
        description: "Debe seleccionar un archivo"
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('tipoEvidencia', tipo)
      if (descripcion) formData.append('descripcion', descripcion)
      formData.append('archivo', file)

      console.log("EVIDENCIA:")
      for (const pair of formData.entries()) {
  console.log(pair[0], pair[1])
}
      await evidenciasAPI.upload(actividad.id, formData)

      toast({
        title: "Evidencia subida",
        description: "La evidencia fue subida exitosamente y está pendiente de revisión"
      })

      onSuccess()
      setTipo('')
      setFile(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al subir evidencia",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subir Evidencia</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Las evidencias son versionadas automáticamente. Si subes un archivo con el mismo nombre, se creará una nueva versión.
            </AlertDescription>
          </Alert>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de evidencia <span className="text-red-500">*</span>
            </Label>
            <Select
              value={tipo}
              onValueChange={setTipo}
              disabled={loading}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EVIDENCIA.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tipo && ALLOWED_EXTENSIONS[tipo].length > 0 && (
              <p className="text-xs text-gray-500">
                Extensiones permitidas: {ALLOWED_EXTENSIONS[tipo].join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Opcional: agrega una descripción de la evidencia"
              disabled={loading}
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>
              Archivo <span className="text-red-500">*</span>
            </Label>

            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive && "border-blue-500 bg-blue-50",
                !dragActive && "border-gray-300 hover:border-gray-400"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Arrastra y suelta tu archivo aquí, o{' '}
                      <label className="text-blue-600 hover:underline cursor-pointer">
                        selecciona un archivo
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          disabled={loading}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tamaño máximo: 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !file || !tipo || !!error}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Evidencia
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}