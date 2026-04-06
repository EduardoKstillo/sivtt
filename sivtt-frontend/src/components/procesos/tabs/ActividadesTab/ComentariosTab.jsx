import { useState, useEffect, useRef } from 'react'
import { Button } from '@components/ui/button'
import { Textarea } from '@components/ui/textarea'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Loader2, Send, CheckCircle2, XCircle, Info } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { useAuthStore } from '@store/authStore'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

export const ComentariosTab = ({ actividad }) => {
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const { user } = useAuthStore()
  const scrollRef = useRef(null)

  const fetchComentarios = async () => {
    try {
      const { data } = await actividadesAPI.getComentarios(actividad.id)
      setComentarios(data.data || [])
    } catch (error) {
      console.error("Error al cargar comentarios", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComentarios()
  }, [actividad.id])

  useEffect(() => {
    // Auto-scroll al fondo cuando hay mensajes nuevos
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comentarios])

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim()) return
    setSubmitting(true)
    try {
      await actividadesAPI.createComentario(actividad.id, nuevoMensaje)
      setNuevoMensaje('')
      await fetchComentarios() // Recargar el chat
    } catch (error) {
      console.error("Error al enviar", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-lg bg-muted/10 overflow-hidden">
      
      {/* 📜 ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {comentarios.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Info className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No hay actividad registrada.</p>
            <p className="text-xs opacity-70">Los mensajes y decisiones de revisión aparecerán aquí.</p>
          </div>
        ) : (
          comentarios.map((msg) => {
            const isMe = msg.usuarioId === user?.id
            const isSystemAction = msg.tipo !== 'MENSAJE'
            const initials = `${msg.usuario.nombres.charAt(0)}${msg.usuario.apellidos.charAt(0)}`

            // Renderizado visual para decisiones (Aprobado/Rechazado)
            if (isSystemAction) {
              const isAprobado = msg.tipo === 'REVISION_APROBADA'
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className={cn(
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border font-medium",
                    isAprobado 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  )}>
                    {isAprobado ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>
                      <strong>{msg.usuario.nombres}</strong> {msg.texto}
                    </span>
                  </div>
                </div>
              )
            }

            // Renderizado visual para mensajes normales (Chat)
            return (
              <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <span className="text-[10px] text-muted-foreground mb-1 mx-1">
                    {msg.usuario.nombres} • {formatDate(msg.createdAt, 'dd/MM HH:mm')}
                  </span>
                  <div className={cn(
                    "px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap",
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  )}>
                    {msg.texto}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ✍️ ÁREA DE INPUT */}
      {actividad.estado !== 'APROBADA' && (
        <div className="p-3 bg-card border-t border-border flex items-end gap-2">
          <Textarea 
            placeholder="Escribe un mensaje, duda o respuesta a una revisión..."
            className="min-h-[40px] max-h-[120px] resize-none text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted/50 p-3"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            disabled={submitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleEnviar()
              }
            }}
          />
          <Button 
            size="icon" 
            className="h-10 w-10 shrink-0 rounded-full" 
            disabled={!nuevoMensaje.trim() || submitting}
            onClick={handleEnviar}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}