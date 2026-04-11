import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  Battery,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Zap,
  Server,
  Network,
  Briefcase,
  Check,
  Loader2,
  Edit3,
  Save,
  X,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { updateAssetStep, updateAsset, ACTIVATION_STEPS } from '@/services/assets'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

interface Props {
  asset: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function AssetDetailSheet({ asset, open, onOpenChange, onUpdate }: Props) {
  const [localAsset, setLocalAsset] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [errors, setErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    setLocalAsset(asset)
    if (asset) setEditData(asset)
  }, [asset])

  if (!localAsset) return null

  const handleSave = async () => {
    setIsSaving(true)
    setErrors({})
    try {
      const updated = await updateAsset(localAsset.id, editData)
      setLocalAsset(updated)
      setIsEditing(false)
      if (onUpdate) onUpdate()
      toast({ title: 'Ativo atualizado com sucesso!' })
    } catch (e) {
      setErrors(extractFieldErrors(e))
      toast({ title: 'Erro ao salvar', description: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const renderRow = (
    label: string,
    field: string,
    type: 'text' | 'number' | 'date' = 'text',
    icon?: React.ReactNode,
  ) => {
    if (isEditing) {
      return (
        <li className="flex flex-col py-2 border-b gap-1">
          <Label className="text-muted-foreground text-xs">{label}</Label>
          <Input
            type={type}
            value={
              editData[field] === null || editData[field] === undefined
                ? ''
                : type === 'date' && editData[field]
                  ? editData[field].split('T')[0]
                  : editData[field]
            }
            onChange={(e) => {
              const val = e.target.value
              setEditData((prev: any) => ({
                ...prev,
                [field]: type === 'number' ? (val === '' ? null : Number(val)) : val,
              }))
            }}
            className="h-8 text-sm"
          />
          {errors[field] && <span className="text-[10px] text-destructive">{errors[field]}</span>}
        </li>
      )
    }

    let displayVal = localAsset[field]
    if (type === 'date' && displayVal) {
      displayVal = new Date(displayVal).toLocaleDateString('pt-BR')
    } else if (displayVal === null || displayVal === undefined || displayVal === '') {
      displayVal = 'N/D'
    }

    return (
      <li className="flex justify-between items-center text-sm py-2 border-b">
        <span className="text-muted-foreground flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="font-medium text-right break-words max-w-[60%]">{String(displayVal)}</span>
      </li>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto pb-10">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mt-4">
            {isEditing ? (
              <Input
                value={editData.asset_name || ''}
                onChange={(e) => setEditData({ ...editData, asset_name: e.target.value })}
                className="font-bold text-lg w-2/3"
              />
            ) : (
              <SheetTitle className="text-xl">{localAsset.asset_name}</SheetTitle>
            )}

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsEditing(false)
                      setErrors({})
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditData(localAsset)
                    setIsEditing(true)
                  }}
                >
                  <Edit3 className="mr-2 h-3 w-3" /> Editar
                </Button>
              )}
            </div>
          </div>
          <SheetDescription className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {localAsset.city || 'Cidade N/D'} {localAsset.uf_code ? `(${localAsset.uf_code})` : ''}{' '}
            | ID: {localAsset.fcu_code}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="technical">Técnico</TabsTrigger>
            <TabsTrigger value="process">Processo</TabsTrigger>
            <TabsTrigger value="location">Local.</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4 text-primary" /> Telemetria & Operação
              </h4>
              <ul className="space-y-1 mb-4">
                {renderRow('Status do Ativo', 'asset_state', 'text')}
                {renderRow(
                  'Receita Mensal (R$)',
                  'contract_value',
                  'number',
                  <DollarSign className="h-3.5 w-3.5" />,
                )}
              </ul>

              <div className="bg-muted p-4 rounded-lg border space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Battery className="h-4 w-4" /> Nível da Bateria
                  </span>
                  <span className="font-medium">{localAsset.battery_level || 0}%</span>
                </div>
                <Progress
                  value={localAsset.battery_level || 0}
                  className="h-2"
                  indicatorClassName={
                    (localAsset.battery_level || 0) > 20 ? 'bg-primary' : 'bg-destructive'
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" /> Histórico Técnico
              </h4>
              <ul className="space-y-1">
                {renderRow('Data de Instalação', 'installation_date', 'date')}
                {renderRow('Uptime Geral (%)', 'uptime', 'number')}
                {renderRow(
                  'MTTR Recente (h)',
                  'mttr_hours',
                  'number',
                  <Clock className="h-3.5 w-3.5" />,
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-4 space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Server className="h-4 w-4 text-primary" /> Especificações do Equipamento
            </h4>
            <ul className="space-y-1">
              {renderRow('Tipo de Gabinete', 'cabinet_type')}
              {renderRow('SN Bastidor', 'rack_serial_number')}
              {renderRow(
                'Tipo de Rede',
                'network_type',
                'text',
                <Network className="h-3.5 w-3.5" />,
              )}
              {renderRow('Qtd. Baterias', 'battery_count', 'number')}
              {renderRow('Nº de Retificadores', 'rectifier_count', 'number')}
              {renderRow('Espec. Retificadores', 'sr_specification')}
              {renderRow('Ar Condicionado', 'air_conditioned')}
              {renderRow('Blindado', 'armored')}
            </ul>
          </TabsContent>

          <TabsContent value="process" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground mb-4">
                <Briefcase className="h-4 w-4 text-primary" /> Workflow de Ativação
              </h4>
              <div className="relative border-l border-border/60 ml-3 pl-6 space-y-6">
                {ACTIVATION_STEPS.map((step, index) => {
                  const currentStepId = localAsset.step_number || '0'
                  const activeIndex = Math.max(
                    0,
                    ACTIVATION_STEPS.findIndex((s) => s.id === currentStepId),
                  )
                  const isCompleted = index < activeIndex
                  const isCurrent = index === activeIndex

                  return (
                    <div key={step.id} className="relative">
                      <div
                        className={`absolute -left-[34px] top-0 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-background
                        ${isCompleted ? 'border-primary text-primary bg-primary/10' : isCurrent ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'}`}
                      >
                        {isCompleted && <Check className="h-3 w-3" />}
                        {isCurrent && <div className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      <div className="-mt-0.5">
                        <h5
                          className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {step.title}
                        </h5>
                        {isCurrent && index < ACTIVATION_STEPS.length - 1 && (
                          <Button
                            size="sm"
                            className="mt-3 h-8 text-xs"
                            onClick={() =>
                              updateAssetStep(
                                localAsset.id,
                                ACTIVATION_STEPS[index + 1].id,
                                'Em Andamento',
                              ).then(onUpdate)
                            }
                            disabled={isUpdating}
                          >
                            Avançar Etapa
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4 space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Endereço e Coordenadas
            </h4>
            <ul className="space-y-1">
              {renderRow('Endereço', 'address')}
              {renderRow('Cidade', 'city')}
              {renderRow('UF', 'uf_code')}
              {renderRow('Latitude', 'latitude', 'number')}
              {renderRow('Longitude', 'longitude', 'number')}
            </ul>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
