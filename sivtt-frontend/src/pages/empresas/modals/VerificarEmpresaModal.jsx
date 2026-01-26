import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

export const VerificarEmpresaModal = ({
  open,
  onOpenChange,
  empresa,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleVerificar = async () => {
    if (!empresa?.id) return

    setLoading(true)

    try {
      await empresasAPI.verify(empresa.id)

      toast({
        title: 'Empresa verificada',
        description: 'La empresa fue verificada exitosamente',
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al verificar',
        description:
          error.response?.data?.message || 'Intente nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  // ⛔ No renderizar si no hay empresa
  if (!empresa) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Verificar Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la empresa */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Información de la Empresa
            </h4>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-500">Razón Social:</span>
                <span className="font-medium text-gray-900">
                  {empresa.razonSocial}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-500">RUC:</span>
                <span className="font-medium text-gray-900">
                  {empresa.ruc}
                </span>
              </div>

              {empresa.sector && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-500">Sector:</span>
                  <span className="font-medium text-gray-900">
                    {empresa.sector}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Advertencia */}
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Antes de verificar, asegúrese de:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Validar que el RUC sea correcto en SUNAT</li>
                <li>Confirmar que los datos de contacto son válidos</li>
                <li>Verificar que la empresa esté activa y habida</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900 text-sm">
              Al verificar la empresa, podrá ser vinculada a procesos
              de transferencia tecnológica.
            </AlertDescription>
          </Alert>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleVerificar}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verificar Empresa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
