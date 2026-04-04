import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileUp, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { upsertAssets } from '@/services/assets'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AssetImportDialog({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<'upload' | 'processing' | 'success' | 'error'>('upload')
  const [progress, setProgress] = useState(0)
  const [resultMessage, setResultMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
    if (lines.length < 2) throw new Error('O arquivo CSV está vazio ou sem cabeçalhos.')

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))

    const rows = lines.slice(1).map((line) => {
      const values: string[] = []
      let inQuotes = false
      let currentValue = ''

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim())

      const obj: Record<string, string> = {}
      headers.forEach((header, i) => {
        obj[header] = values[i]?.replace(/^"|"$/g, '') || ''
      })
      return obj
    })

    return rows
  }

  const mapToAsset = (row: Record<string, string>) => {
    const getVal = (keys: string[]) => {
      const key = Object.keys(row).find((k) =>
        keys.some((match) => k.toLowerCase().includes(match.toLowerCase())),
      )
      return key ? row[key] : null
    }

    const fcu = getVal(['fcu', 'código', 'codigo'])
    if (!fcu) return null

    return {
      fcu_code: fcu,
      asset_name: getVal(['nome', 'ativo', 'site', 'name']) || `Ativo ${fcu}`,
      asset_status: getVal(['status']) || 'Operacional',
      region: getVal(['região', 'regiao', 'regional', 'region']),
      uf_code: getVal(['uf', 'estado']),
      city: getVal(['cidade', 'município', 'municipio', 'city']),
      cabinet_type: getVal(['gabinete', 'cabinet', 'tipogabinete']),
      rack_serial_number: getVal(['serial', 'série', 'serie']),
      address: getVal(['endereço', 'endereco', 'address', 'local']),
      battery_count: parseInt(getVal(['bateria', 'battery']) || '0') || null,
      rectifier_count: parseInt(getVal(['retificador', 'rectifier']) || '0') || null,
      network_type: getVal(['rede', 'network']),
      is_active: getVal(['ativo', 'active'])?.toLowerCase() !== 'não',
      is_in_stock: getVal(['estoque', 'stock'])?.toLowerCase() === 'sim',
      coordinates_raw: getVal(['coord', 'lat']),
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStep('processing')
    setProgress(10)

    try {
      const text = await file.text()
      setProgress(30)

      const rows = parseCSV(text)
      setProgress(50)

      const assets = rows.map(mapToAsset).filter(Boolean)

      if (assets.length === 0) {
        throw new Error(
          'Nenhum dado válido encontrado. Verifique se as colunas estão mapeadas corretamente (ex: Código FCU).',
        )
      }

      setProgress(70)

      const BATCH_SIZE = 100
      let processed = 0

      for (let i = 0; i < assets.length; i += BATCH_SIZE) {
        const batch = assets.slice(i, i + BATCH_SIZE)
        await upsertAssets(batch)
        processed += batch.length
        setProgress(70 + Math.floor((processed / assets.length) * 25))
      }

      setProgress(100)
      setResultMessage(`${assets.length} registros processados com sucesso.`)
      setStep('success')

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Erro na importação:', err)
      setErrorMessage(err.message || 'Ocorreu um erro desconhecido durante a importação.')
      setStep('error')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('upload')
      setProgress(0)
      setErrorMessage('')
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
            código FCU para atualizar registros existentes ou inserir novos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/30">
          {step === 'upload' && (
            <div className="text-center space-y-4 px-4 w-full">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Selecione seu arquivo CSV</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Certifique-se que o arquivo contém a coluna "Código FCU"
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xs mx-auto"
              >
                Procurar Arquivo
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center w-full px-8 space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm font-medium">Processando e Normalizando Dados...</p>
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Validando tipos de dados e sincronizando com o banco...
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
                <p className="text-xs text-muted-foreground mt-1">{resultMessage}</p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-4 px-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-500">
                  Erro na Importação
                </p>
                <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                className="w-full max-w-xs mx-auto"
              >
                Tentar Novamente
              </Button>
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
                  description: 'A tabela de ativos foi atualizada.',
                })
              }}
            >
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
