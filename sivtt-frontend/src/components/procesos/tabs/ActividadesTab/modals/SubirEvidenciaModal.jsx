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

// Mapeo de extensión a tipo de evidencia
const EXTENSION_TIPOS = {
  'pdf': 'DOCUMENTO', 'doc': 'DOCUMENTO', 'docx': 'DOCUMENTO', 'txt': 'DOCUMENTO',
  'jpg': 'IMAGEN', 'jpeg': 'IMAGEN', 'png': 'IMAGEN',
  'mp4': 'VIDEO', 'avi': 'VIDEO',
  'ppt': 'PRESENTACION', 'pptx': 'PRESENTACION'
}

export const SubirEvidenciaModal = ({ open, onOpenChange, actividad, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [requisitoId, setRequisitoId] = useState('extra')
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  // Recuperar requisitos de la actividad
  const requisitos = actividad?.requisitos || []

  // Resetear al abrir
  useEffect(() => {
    if (open) {
      setFile(null)
      // Si hay requisitos, seleccionar el primero pendiente por defecto (opcional)
      // Por ahora dejamos 'extra' o el primero si quieres forzar
      setRequisitoId('extra')
    }
  }, [open])

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({ variant: 'destructive', title: 'Error', description: 'El archivo supera los 10MB' })
      return
    }
    setFile(selectedFile)
  }

  // Drag handlers...
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else setDragActive(false); }
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }

const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      
      // 1️⃣ PRIMERO: Campos de texto (para que Multer los lea antes del archivo)
      
      // Si seleccionó un requisito, enviamos su ID
      if (requisitoId !== 'extra') {
        formData.append('requisitoId', requisitoId)
      }

      // Autodetectar tipo
      const ext = file.name.split('.').pop().toLowerCase()
      const tipo = EXTENSION_TIPOS[ext] || 'OTRO'
      formData.append('tipoEvidencia', tipo)
      formData.append('nombreArchivo', file.name)
      
      // 2️⃣ AL FINAL: El archivo
      formData.append('archivo', file)

      await evidenciasAPI.upload(actividad.id, formData)

      toast({ title: "Evidencia subida", description: "Se ha generado una nueva versión." })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: err.response?.data?.message || 'Error al subir archivo' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Subir Evidencia</DialogTitle></DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-xs">
              Selecciona el entregable para mantener el historial de versiones ordenado.
            </AlertDescription>
          </Alert>

          {/* 🔥 SELECTOR DE REQUISITO (Ahora debería funcionar) */}
          <div className="space-y-2">
            <Label>¿A qué corresponde este archivo?</Label>
            <Select value={requisitoId} onValueChange={setRequisitoId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {requisitos.length > 0 ? (
                  requisitos.map(req => (
                    <SelectItem key={req.id} value={req.id.toString()}>
                      📄 {req.nombre} {req.obligatorio ? '(Obligatorio)' : '(Opcional)'}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No hay entregables definidos</SelectItem>
                )}
                <SelectItem value="extra">📎 Archivo Adicional / Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area */}
          <div className="space-y-2">
            <Label>Archivo</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
              )}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div className="text-sm text-gray-600">
                    Arrastra o <label className="text-blue-600 hover:underline cursor-pointer">selecciona<input type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} disabled={loading} /></label> un archivo
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Subir Archivo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}