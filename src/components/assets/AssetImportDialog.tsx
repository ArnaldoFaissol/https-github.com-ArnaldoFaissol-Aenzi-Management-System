import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileUp, CheckCircle2, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetImportDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<'upload' | 'processing' | 'success' | 'error'>('upload')
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleSimulateImport = () => {
    setStep('processing')
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStep('success')
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('upload')
      setProgress(0)
    }, 300)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose()
        else onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Base de Ativos</DialogTitle>
          <DialogDescription>
            Faça o upload do seu CSV atualizado para sincronizar o banco de dados. O sistema usará o
            código FCU para evitar duplicatas.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/30">
          {step === 'upload' && (
            <div className="text-center space-y-4 px-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Arraste seu arquivo CSV aqui</p>
                <p className="text-xs text-muted-foreground mt-1">
                  O arquivo deve conter as colunas mapeadas (FCU, TipoGabinete, etc.)
                </p>
              </div>
              <Button onClick={handleSimulateImport} className="w-full max-w-xs mx-auto">
                Selecionar Arquivo
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center w-full px-8 space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm font-medium">Processando e Normalizando Dados...</p>
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground text-left mt-2">
                Validando tipos de dados, datas e valores monetários...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 px-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-500">
                  Importação Concluída!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  152 registros atualizados e 48 novos inseridos com sucesso.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={handleClose}>
            {step === 'success' ? 'Fechar' : 'Cancelar'}
          </Button>
          {step === 'success' && (
            <Button
              onClick={() => {
                handleClose()
                toast({
                  title: 'Dados sincronizados',
                  description: 'A tabela de ativos foi atualizada com os novos dados.',
                })
              }}
            >
              Ver Tabela
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
