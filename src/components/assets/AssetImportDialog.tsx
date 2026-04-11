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
import { getErrorMessage } from '@/lib/pocketbase/errors'

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

    const delimiter = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))

    return lines.slice(1).map((line) => {
      const values: string[] = []
      let inQuotes = false
      let currentValue = ''

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') inQuotes = !inQuotes
        else if (char === delimiter && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else currentValue += char
      }
      values.push(currentValue.trim())

      const obj: Record<string, string> = {}
      headers.forEach((header, i) => {
        obj[header] = values[i]?.replace(/^"|"$/g, '') || ''
      })
      return obj
    })
  }

  const parseNumber = (val: string | null | undefined) => {
    if (!val) return null
    const cleaned = val
      .toString()
      .trim()
      .replace(/[R$\s]/g, '')
    if (cleaned.includes(',') && cleaned.includes('.')) {
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
        return isNaN(num) ? null : num
      } else {
        const num = parseFloat(cleaned.replace(/,/g, ''))
        return isNaN(num) ? null : num
      }
    } else if (cleaned.includes(',')) {
      const num = parseFloat(cleaned.replace(',', '.'))
      return isNaN(num) ? null : num
    } else {
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num
    }
  }

  const parseDate = (val: string | null | undefined) => {
    if (!val) return null
    const parts = val.split(/[/-]/)
    if (parts.length === 3) {
      if (parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]} 12:00:00.000Z`
      } else if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1]}-${parts[2]} 12:00:00.000Z`
      }
    }
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d.toISOString()
  }

  const processCSV = (rows: Record<string, string>[]) => {
    const assets = []

    const getVal = (row: Record<string, string>, keys: string[]) => {
      const key = Object.keys(row).find((k) =>
        keys.some((match) => k.toLowerCase().includes(match.toLowerCase())),
      )
      return key ? row[key] : null
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const fcu = getVal(row, ['fcu', 'código', 'codigo'])
      if (!fcu) continue

      const rawMonthlyRevenue = getVal(row, [
        'receita',
        'monthly_revenue',
        'receita/mês',
        'receita/mes',
        'contract_value',
      ])
      const monthly_revenue = parseNumber(rawMonthlyRevenue)
      if (rawMonthlyRevenue && rawMonthlyRevenue.trim() !== '' && monthly_revenue === null) {
        throw new Error(
          `Linha ${i + 2} (FCU: ${fcu}): Valor inválido para Receita/Mês ("${rawMonthlyRevenue}"). Deve ser numérico.`,
        )
      }

      const rawLat = getVal(row, ['lat', 'latitude'])
      const rawLon = getVal(row, ['lon', 'longitude'])
      let latitude = parseNumber(rawLat)
      let longitude = parseNumber(rawLon)

      if (latitude === null && longitude === null) {
        const coords = getVal(row, ['coordenadas', 'coordinates', 'coord'])
        if (coords) {
          const parts = coords.split(',').map((p) => p.trim())
          if (parts.length === 2) {
            latitude = parseNumber(parts[0])
            longitude = parseNumber(parts[1])
          }
        }
      }

      const rawAirCond = getVal(row, ['ar condicionado', 'air_conditioning', 'ac'])
      const air_conditioning = rawAirCond
        ? rawAirCond.toLowerCase() === 'sim' ||
          rawAirCond.toLowerCase() === 'true' ||
          rawAirCond.toLowerCase() === '1'
        : false

      const rawBluetooth = getVal(row, ['bluetooth'])
      const bluetooth = rawBluetooth
        ? rawBluetooth.toLowerCase() === 'sim' ||
          rawBluetooth.toLowerCase() === 'true' ||
          rawBluetooth.toLowerCase() === '1'
        : false

      assets.push({
        fcu_code: fcu,
        asset_name: getVal(row, ['nome', 'ativo', 'site', 'name']) || `Ativo ${fcu}`,
        asset_state: getVal(row, ['status', 'estado']) || 'Operacional',
        uf_code: getVal(row, ['uf', 'estado', 'state']),
        city: getVal(row, ['cidade', 'município', 'municipio', 'city']),
        cabinet_type: getVal(row, ['gabinete', 'cabinet', 'tipogabinete']),
        rack_serial_number: getVal(row, ['serial', 'série', 'serie']),
        address: getVal(row, ['endereço', 'endereco', 'address', 'local']),
        battery_qty: parseNumber(getVal(row, ['bateria', 'battery', 'qtd. baterias'])),
        rectifier_number: parseNumber(
          getVal(row, [
            'retificador',
            'rectifier',
            'número de retificadores',
            'numero de retificadores',
          ]),
        ),
        network_type: getVal(row, ['rede', 'network']),
        is_active: getVal(row, ['ativo', 'active'])?.toLowerCase() !== 'não',
        is_in_stock: getVal(row, ['estoque', 'stock'])?.toLowerCase() === 'sim',
        utility: getVal(row, ['concessionária', 'concessionaria', 'utility']),
        pendency: parseNumber(getVal(row, ['pendência', 'pendencia', 'pendency'])) || 0,
        step_number: getVal(row, ['etapa', 'step']),
        process_status: getVal(row, ['status do processo', 'processo', 'process_status']),
        air_conditioning,
        bluetooth,
        armored: getVal(row, ['blindado', 'blindagem', 'armored']),
        iams_regional: getVal(row, ['iams regional', 'regional', 'iams_regional']),
        rack_key: getVal(row, ['rack key', 'chave', 'rack_key']),
        holder: getVal(row, ['holder', 'detentor']),
        monthly_revenue,
        installation_date: parseDate(
          getVal(row, ['data de instalação', 'instalação', 'installation_date', 'data']),
        ),
        latitude,
        longitude,
        rectifier_spec: getVal(row, ['espec', 'especificação', 'espec. retificadores']),
      })
    }
    return assets
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
      const assets = processCSV(rows)

      if (assets.length === 0) {
        throw new Error(
          'Nenhum dado válido encontrado. Verifique se as colunas estão mapeadas corretamente (ex: Código FCU).',
        )
      }

      setProgress(70)
      const BATCH_SIZE = 50
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
      setErrorMessage(err.message || getErrorMessage(err))
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
          <DialogTitle>Importar para Skip Cloud</DialogTitle>
          <DialogDescription>
            Faça o upload do seu CSV atualizado para sincronizar os ativos. O sistema mapeará
            automaticamente os dados geográficos, financeiros e técnicos.
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
                  Deve conter a coluna "Código FCU"
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
              <p className="text-sm font-medium">Processando Dados...</p>
              <Progress value={progress} className="h-2 w-full" />
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
