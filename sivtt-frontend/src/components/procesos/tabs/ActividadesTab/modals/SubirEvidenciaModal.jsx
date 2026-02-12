import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Upload, Loader2, File, X, Link as LinkIcon } from 'lucide-react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024

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

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover") }
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]) }

  const handleFileChange = (selectedFile) => {
    if (selectedFile?.size > MAX_FILE_SIZE) {
      toast({ variant: 'destructive', title: 'Error', description: 'El archivo supera los 10MB' })
      return
    }
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
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
      if (requisitoId && requisitoId !== 'extra') {
        formData.append('requisitoId', requisitoId)
      }

      if (mode === 'FILE') {
        const ext = file.name.split('.').pop().toLowerCase()
        const tipo = EXTENSION_TIPOS[ext] || 'DOCUMENTO'
        formData.append('tipoEvidencia', tipo)
        formData.append('nombreArchivo', file.name)
        formData.append('archivo', file)
      } else {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Evidencia</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs">Entregable Vinculado</Label>
            <Select value={requisitoId} onValueChange={setRequisitoId} disabled={loading}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {requisitos.map(req => (
                  <SelectItem key={req.id} value={req.id.toString()}>
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        req.obligatorio ? "bg-amber-500" : "bg-slate-300"
                      )} />
                      {req.nombre}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="extra">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Adicional / Otro
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={mode} onValueChange={setMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="FILE" className="text-xs gap-1.5">
                <Upload className="h-3 w-3" /> Archivo
              </TabsTrigger>
              <TabsTrigger value="LINK" className="text-xs gap-1.5">
                <LinkIcon className="h-3 w-3" /> Enlace
              </TabsTrigger>
            </TabsList>

            {/* FILE MODE */}
            <TabsContent value="FILE" className="mt-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <File className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="font-medium text-sm text-foreground truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Arrastra o{' '}
                      <label className="text-primary hover:underline cursor-pointer font-medium">
                        selecciona un archivo
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} disabled={loading} />
                      </label>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60">Máximo 10 MB</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* LINK MODE */}
            <TabsContent value="LINK" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label className="text-xs">URL del Recurso</Label>
                <Input 
                  placeholder="https://docs.google.com/..." 
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nombre para mostrar</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}