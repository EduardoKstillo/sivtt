import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Upload, Loader2, File, X, Info, Link as LinkIcon } from 'lucide-react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const EXTENSION_TIPOS = {
  'pdf': 'DOCUMENTO', 'doc': 'DOCUMENTO', 'docx': 'DOCUMENTO',
  'jpg': 'IMAGEN', 'jpeg': 'IMAGEN', 'png': 'IMAGEN',
  'mp4': 'VIDEO', 'xlsx': 'DOCUMENTO', 'pptx': 'PRESENTACION'
}

export const SubirEvidenciaModal = ({ open, onOpenChange, actividad, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('FILE') 
  const [requisitoId, setRequisitoId] = useState('extra')
  
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  
  const [linkUrl, setLinkUrl] = useState('')
  const [linkNombre, setLinkNombre] = useState('')

  const requisitos = actividad?.requisitos || []

  useEffect(() => {
    if (open) {
      setFile(null)
      setLinkUrl('')
      setLinkNombre('')
      setRequisitoId('extra')
      setMode('FILE')
    }
  }, [open])

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); }
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }

  const handleFileChange = (selectedFile) => {
    if (selectedFile?.size > MAX_FILE_SIZE) {
      toast({ variant: 'destructive', title: 'Error', description: 'El archivo supera los 10MB' })
      return
    }
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 🛑 VALIDACIONES VISUALES (Antes fallaba silenciosamente aquí)
    if (mode === 'FILE' && !file) {
        toast({ variant: 'destructive', title: 'Falta archivo', description: 'Por favor seleccione un archivo.' })
        return
    }
    if (mode === 'LINK' && (!linkUrl.trim() || !linkNombre.trim())) {
        toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Ingrese la URL y un nombre para el enlace.' })
        return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      
      // 1. Requisito
      if (requisitoId && requisitoId !== 'extra') {
        formData.append('requisitoId', requisitoId)
      }

      // 2. Datos según modo
      if (mode === 'FILE') {
          const ext = file.name.split('.').pop().toLowerCase()
          const tipo = EXTENSION_TIPOS[ext] || 'DOCUMENTO'
          formData.append('tipoEvidencia', tipo)
          formData.append('nombreArchivo', file.name)
          formData.append('archivo', file)
      } else {
          // Si tu BD no tiene enum ENLACE, usa OTRO o DOCUMENTO
          formData.append('tipoEvidencia', 'ENLACE') 
          formData.append('nombreArchivo', linkNombre)
          formData.append('link', linkUrl) 
      }

      await evidenciasAPI.create(actividad.id, formData)

      toast({ title: "Evidencia subida exitosamente" })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({ 
        variant: 'destructive', 
        title: 'Error al subir', 
        description: err.response?.data?.message || 'Verifique su conexión e intente nuevamente' 
      })
    } finally {
      setLoading(false)
    }
  }

  // ... (El resto del renderizado / return se mantiene igual)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Agregar Evidencia</DialogTitle></DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-2">
            <Label>Entregable Vinculado</Label>
            <Select value={requisitoId} onValueChange={setRequisitoId} disabled={loading}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {requisitos.map(req => (
                  <SelectItem key={req.id} value={req.id.toString()}>
                    {req.obligatorio ? '🔴 ' : '⚪ '} {req.nombre}
                  </SelectItem>
                ))}
                <SelectItem value="extra">📎 Adicional / Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={mode} onValueChange={setMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="FILE">Subir Archivo</TabsTrigger>
              <TabsTrigger value="LINK">Adjuntar Enlace</TabsTrigger>
            </TabsList>

            {/* MODO ARCHIVO */}
            <TabsContent value="FILE" className="space-y-3 mt-4">
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
                    <div className="text-left overflow-hidden">
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
                      Arrastra o <label className="text-blue-600 hover:underline cursor-pointer">selecciona<input type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} disabled={loading} /></label>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* MODO LINK */}
            <TabsContent value="LINK" className="space-y-3 mt-4">
                <div className="space-y-2">
                    <Label>URL del Recurso</Label>
                    <Input 
                        placeholder="https://docs.google.com/..." 
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Nombre para mostrar</Label>
                    <Input 
                        placeholder="Ej: Carpeta de Drive, Video en Youtube" 
                        value={linkNombre}
                        onChange={e => setLinkNombre(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}