import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { 
  Check, 
  X, 
  Loader2, 
  FileText, 
  ExternalLink 
} from 'lucide-react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

export const RevisarEvidenciaModal = ({ open, onOpenChange, evidencia, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [decision, setDecision] = useState(null) // 'APROBADA' | 'RECHAZADA' | null
  const [comentario, setComentario] = useState('')

  if (!evidencia) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!decision) {
      toast({ 
        variant: "destructive", 
        title: "Acción requerida", 
        description: "Debes seleccionar Aprobar o Rechazar." 
      })
      return
    }

    if (decision === 'RECHAZADA' && !comentario.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Falta justificación", 
        description: "El rechazo requiere un comentario obligatorio." 
      })
      return
    }

    setLoading(true)

    try {
      await evidenciasAPI.review(evidencia.id, {
        nuevoEstado: decision,
        comentarioRevision: comentario.trim() || undefined
      })

      toast({
        title: decision === 'APROBADA' ? "Evidencia Aprobada" : "Evidencia Rechazada",
        description: decision === 'APROBADA' 
          ? "El documento ha sido validado correctamente."
          : "Se ha notificado al usuario para realizar correcciones."
      })

      onSuccess()
      handleClose()
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No se pudo procesar la solicitud." 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setDecision(null)
      setComentario('')
    }, 300)
  }

  const uploaderName = evidencia.usuario?.nombre || evidencia.subidoPor?.nombres

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start mb-2">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Revisión de Evidencia
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Evalúa el cumplimiento del documento adjunto.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          
          {/* TARJETA DE DOCUMENTO */}
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            {/* Icono de archivo */}
            <div className="w-16 h-20 bg-muted/50 rounded-lg flex-shrink-0 border border-border flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-foreground font-semibold text-base truncate mb-1">
                {evidencia.nombreArchivo}
              </h4>
              <div className="text-muted-foreground text-xs space-y-0.5 mb-3">
                <p>
                  Versión: <span className="font-medium text-foreground">v{evidencia.version}</span>
                </p>
                {uploaderName && (
                  <p>
                    Autor: <span className="font-medium text-foreground">{uploaderName}</span>
                  </p>
                )}
              </div>
              
              <Button
                type="button"
                variant="default"
                size="sm"
                className="w-full h-9 text-xs font-medium gap-2"
                onClick={() => window.open(evidencia.urlArchivo, '_blank')}
              >
                Abrir documento
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* BOTONES DE DECISIÓN */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Dictamen de revisión
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APROBADA')}
                disabled={loading}
                className={cn(
                  "relative flex items-center justify-center gap-2 h-14 rounded-xl font-semibold transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  decision === 'APROBADA'
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 scale-[1.02] focus:ring-emerald-500"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                )}
              >
                <span>Aprobar</span>
                {decision === 'APROBADA' && <Check className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={() => setDecision('RECHAZADA')}
                disabled={loading}
                className={cn(
                  "relative flex items-center justify-center gap-2 h-14 rounded-xl font-semibold transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  decision === 'RECHAZADA'
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 scale-[1.02] focus:ring-rose-500"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border hover:border-rose-300 dark:hover:border-rose-700"
                )}
              >
                <span>Rechazar</span>
                {decision === 'RECHAZADA' && <X className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* INPUT DE OBSERVACIONES */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="obs" className="text-sm font-medium text-foreground">
                Observaciones
                {decision === 'APROBADA' && (
                  <span className="text-muted-foreground font-normal ml-1">(Opcional)</span>
                )}
              </Label>
            </div>
            <Textarea
              id="obs"
              placeholder="Añade una nota..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="min-h-[100px] resize-none text-sm"
              maxLength={500}
              disabled={loading}
            />
            
            {/* Mensaje de consecuencia y contador */}
            <div className="flex justify-between items-center text-xs min-h-[16px]">
              <span className={cn(
                "transition-opacity duration-300 font-medium",
                decision ? "opacity-100" : "opacity-0",
                decision === 'APROBADA' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}>
                {decision === 'APROBADA' 
                  ? "✓ Evidencia marcada como válida" 
                  : "⚠ La actividad pasará a estado observado"}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {comentario.length}/500
              </span>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !decision}
              className={cn(
                "min-w-[160px] font-semibold transition-all duration-200 gap-2",
                decision === 'APROBADA' 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" 
                  : decision === 'RECHAZADA'
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                    : ""
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {decision === 'APROBADA' 
                ? 'Confirmar Aprobación' 
                : decision === 'RECHAZADA' 
                  ? 'Confirmar Rechazo' 
                  : 'Seleccionar Acción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// import { useState } from 'react'
// import {
//   Dialog,
//   DialogContent,
// } from '@components/ui/dialog'
// import { Button } from '@components/ui/button'
// import { Textarea } from '@components/ui/textarea'
// import { CheckCircle2, XCircle, Loader2, Eye, ExternalLink, AlertCircle } from 'lucide-react'
// import { evidenciasAPI } from '@api/endpoints/evidencias'
// import { toast } from '@components/ui/use-toast'
// import { cn } from '@/lib/utils'

// export const RevisarEvidenciaModal = ({ open, onOpenChange, evidencia, onSuccess }) => {
//   const [loading, setLoading] = useState(false)
//   const [decision, setDecision] = useState(null)
//   const [comentario, setComentario] = useState('')

//   if (!evidencia) return null

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!decision) {
//       toast({ 
//         variant: "destructive", 
//         title: "Decisión requerida", 
//         description: "Debe aprobar o rechazar la evidencia" 
//       })
//       return
//     }

//     if (decision === 'RECHAZADA' && !comentario.trim()) {
//       toast({ 
//         variant: "destructive", 
//         title: "Comentario requerido", 
//         description: "Debe explicar el motivo del rechazo" 
//       })
//       return
//     }

//     setLoading(true)

//     try {
//       await evidenciasAPI.review(evidencia.id, {
//         nuevoEstado: decision,
//         comentarioRevision: comentario.trim() || undefined
//       })

//       toast({
//         title: decision === 'APROBADA' ? "Evidencia aprobada" : "Evidencia rechazada",
//         description: decision === 'APROBADA' 
//           ? "La evidencia fue aprobada exitosamente"
//           : "La evidencia fue rechazada y la actividad cambió a OBSERVADA"
//       })

//       onSuccess()
//       resetForm()
//     } catch (error) {
//       toast({ 
//         variant: "destructive", 
//         title: "Error al revisar", 
//         description: error.response?.data?.message || "Intente nuevamente" 
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetForm = () => {
//     setDecision(null)
//     setComentario('')
//   }

//   const handleClose = () => {
//     onOpenChange(false)
//     resetForm()
//   }

//   const uploaderName = evidencia.usuario?.nombre || evidencia.subidoPor?.nombres
//   const isLastPending = evidencia.actividad?.evidencias?.pendientes === 1

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
//         {/* Header minimalista */}
//         <div className="px-8 pt-8 pb-6">
//           <h2 className="text-2xl font-semibold text-foreground">
//             Revisión de Evidencia
//           </h2>
//           <p className="text-muted-foreground mt-2">
//             {evidencia.nombreArchivo}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="flex flex-col">
//           {/* Content Area */}
//           <div className="px-8 pb-8 space-y-8">
//             {/* Vista previa del archivo */}
//             <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/40 border border-border/50">
//               <div className="flex items-center gap-4">
//                 <div className="text-sm text-muted-foreground">
//                   <span className="font-medium text-foreground">v{evidencia.version}</span>
//                   {uploaderName && (
//                     <>
//                       <span className="mx-2">·</span>
//                       <span>{uploaderName}</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="gap-2"
//                 onClick={() => window.open(evidencia.urlArchivo, '_blank')}
//               >
//                 <Eye className="h-4 w-4" />
//                 Ver archivo
//                 <ExternalLink className="h-3.5 w-3.5 opacity-60" />
//               </Button>
//             </div>

//             {/* Alert condicional */}
//             {isLastPending && (
//               <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
//                 <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
//                 <p className="text-sm text-amber-900 dark:text-amber-100">
//                   <strong>Última evidencia pendiente.</strong> Si apruebas, la actividad pasará automáticamente a LISTA_PARA_CIERRE.
//                 </p>
//               </div>
//             )}

//             {/* Decisión - Diseño simple de radio buttons */}
//             <div className="space-y-4">
//               <label className="text-sm font-medium text-foreground">
//                 ¿Cuál es tu decisión?
//               </label>

//               <div className="space-y-3">
//                 <button
//                   type="button"
//                   onClick={() => setDecision('APROBADA')}
//                   disabled={loading}
//                   className={cn(
//                     "w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left",
//                     decision === 'APROBADA'
//                       ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
//                       : "border-border hover:border-emerald-200 dark:hover:border-emerald-900/50"
//                   )}
//                 >
//                   <div className={cn(
//                     "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
//                     decision === 'APROBADA'
//                       ? "border-emerald-500 bg-emerald-500"
//                       : "border-muted-foreground/30"
//                   )}>
//                     {decision === 'APROBADA' && (
//                       <div className="w-2 h-2 rounded-full bg-white" />
//                     )}
//                   </div>
//                   <div>
//                     <div className="font-medium text-foreground">Aprobar</div>
//                     <div className="text-sm text-muted-foreground mt-0.5">
//                       La evidencia cumple con los requisitos
//                     </div>
//                   </div>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setDecision('RECHAZADA')}
//                   disabled={loading}
//                   className={cn(
//                     "w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left",
//                     decision === 'RECHAZADA'
//                       ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
//                       : "border-border hover:border-rose-200 dark:hover:border-rose-900/50"
//                   )}
//                 >
//                   <div className={cn(
//                     "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
//                     decision === 'RECHAZADA'
//                       ? "border-rose-500 bg-rose-500"
//                       : "border-muted-foreground/30"
//                   )}>
//                     {decision === 'RECHAZADA' && (
//                       <div className="w-2 h-2 rounded-full bg-white" />
//                     )}
//                   </div>
//                   <div>
//                     <div className="font-medium text-foreground">Rechazar</div>
//                     <div className="text-sm text-muted-foreground mt-0.5">
//                       Requiere correcciones
//                     </div>
//                   </div>
//                 </button>
//               </div>
//             </div>

//             {/* Comentarios */}
//             {decision && (
//               <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
//                 <label htmlFor="comentario" className="text-sm font-medium text-foreground">
//                   {decision === 'RECHAZADA' ? 'Explica las correcciones necesarias' : 'Comentarios (opcional)'}
//                 </label>
//                 <div className="relative">
//                   <Textarea
//                     id="comentario"
//                     value={comentario}
//                     onChange={(e) => setComentario(e.target.value)}
//                     placeholder={
//                       decision === 'RECHAZADA' 
//                         ? "Describe qué debe corregirse..."
//                         : "Agrega observaciones si lo deseas..."
//                     }
//                     rows={4}
//                     maxLength={500}
//                     disabled={loading}
//                     className="resize-none text-sm"
//                   />
//                   <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60 tabular-nums">
//                     {comentario.length}/500
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Footer con acciones */}
//           <div className="px-8 py-6 bg-muted/20 border-t border-border flex items-center justify-between">
//             <Button
//               type="button"
//               variant="ghost"
//               onClick={handleClose}
//               disabled={loading}
//             >
//               Cancelar
//             </Button>

//             <Button
//               type="submit"
//               disabled={loading || !decision}
//               className={cn(
//                 "gap-2 min-w-[140px]",
//                 decision === 'APROBADA' && "bg-emerald-600 hover:bg-emerald-700",
//                 decision === 'RECHAZADA' && "bg-rose-600 hover:bg-rose-700"
//               )}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Procesando
//                 </>
//               ) : decision === 'APROBADA' ? (
//                 <>
//                   <CheckCircle2 className="h-4 w-4" />
//                   Aprobar
//                 </>
//               ) : decision === 'RECHAZADA' ? (
//                 <>
//                   <XCircle className="h-4 w-4" />
//                   Rechazar
//                 </>
//               ) : (
//                 'Selecciona una opción'
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }