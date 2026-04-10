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
  Lock,
  Info,
  Briefcase,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { updateAssetStep, ACTIVATION_STEPS } from '@/services/assets'
import { useToast } from '@/hooks/use-toast'

interface Props {
  asset: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function AssetDetailSheet({ asset, open, onOpenChange, onUpdate }: Props) {
  const [localAsset, setLocalAsset] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLocalAsset(asset)
  }, [asset])

  if (!localAsset) return null

  const advanceStep = async (nextStepId: string) => {
    setIsUpdating(true)
    try {
      await updateAssetStep(localAsset.id, nextStepId, 'Em Andamento')
      setLocalAsset({ ...localAsset, step_number: nextStepId, process_status: 'Em Andamento' })
      if (onUpdate) onUpdate()
      toast({ title: 'Etapa avançada com sucesso!' })
    } catch (e) {
      toast({ title: 'Erro ao avançar etapa', variant: 'destructive' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mt-4">
            <SheetTitle className="text-2xl">{localAsset.asset_name}</SheetTitle>
            <Badge
              variant="outline"
              className={
                localAsset.asset_state === 'Operacional' || localAsset.asset_state === 'Ativo'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : localAsset.asset_state === 'Manutenção'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-muted text-muted-foreground'
              }
            >
              {localAsset.asset_state || 'N/D'}
            </Badge>
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
                <Activity className="h-4 w-4 text-primary" />
                Telemetria & Operação
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Zap className="h-3.5 w-3.5" /> Consumo Total
                  </span>
                  <span className="font-mono text-lg font-medium">
                    {localAsset.kwh_total || 0} kWh
                  </span>
                </div>
                <div className="bg-muted p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <DollarSign className="h-3.5 w-3.5" /> Receita/Mês
                  </span>
                  <span className="font-mono text-lg font-medium text-primary">
                    R$ {(localAsset.contract_value || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

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

            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Histórico Técnico
              </h4>

              <ul className="space-y-3">
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Data de Instalação</span>
                  <span className="font-medium">
                    {localAsset.installation_date
                      ? new Date(localAsset.installation_date).toLocaleDateString('pt-BR')
                      : 'Pendente'}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Uptime Geral</span>
                  <span className="font-medium">{localAsset.uptime || 0}%</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> MTTR Recente
                  </span>
                  <span className="font-medium text-destructive">
                    {localAsset.mttr_hours || 'N/A'} h
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Server className="h-4 w-4 text-primary" />
                Especificações do Equipamento
              </h4>

              <ul className="space-y-3">
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Tipo de Gabinete</span>
                  <span className="font-medium">{localAsset.cabinet_type || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">SN Bastidor</span>
                  <span className="font-medium">{localAsset.rack_serial_number || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Tipo de Rede</span>
                  <span className="font-medium flex items-center gap-1">
                    <Network className="h-3.5 w-3.5" /> {localAsset.network_type || 'N/D'}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Qtd. Baterias</span>
                  <span className="font-medium">{localAsset.battery_count ?? 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Ar Condicionado</span>
                  <span className="font-medium">{localAsset.air_conditioner || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Blindado</span>
                  <span className="font-medium">{localAsset.armored || 'N/D'}</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="process" className="mt-4 space-y-4 pb-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground mb-4">
                <Briefcase className="h-4 w-4 text-primary" />
                Workflow de Ativação
              </h4>

              <div className="relative border-l border-border/60 ml-3 pl-6 space-y-6">
                {ACTIVATION_STEPS.map((step, index) => {
                  const currentStepId = localAsset.step_number || '0'
                  const currentStepIndex = ACTIVATION_STEPS.findIndex((s) => s.id === currentStepId)
                  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0
                  const isCompleted = index < activeIndex
                  const isCurrent = index === activeIndex

                  return (
                    <div key={step.id} className="relative">
                      <div
                        className={`absolute -left-[34px] top-0 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-background
                          ${
                            isCompleted
                              ? 'border-primary text-primary bg-primary/10'
                              : isCurrent
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/30 text-transparent'
                          }`}
                      >
                        {isCompleted && <Check className="h-3 w-3" />}
                        {isCurrent && <div className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      <div className="-mt-0.5">
                        <h5
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? 'text-primary'
                              : isCompleted
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-muted-foreground">Responsável:</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {step.responsible}
                          </Badge>
                        </div>
                        {isCurrent && index < ACTIVATION_STEPS.length - 1 && (
                          <Button
                            size="sm"
                            className="mt-3 h-8 text-xs w-full sm:w-auto shadow-sm"
                            onClick={() => advanceStep(ACTIVATION_STEPS[index + 1].id)}
                            disabled={isUpdating}
                          >
                            {isUpdating && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                            Avançar para Próxima Etapa
                          </Button>
                        )}
                        {isCurrent && index === ACTIVATION_STEPS.length - 1 && (
                          <Badge className="mt-3 bg-green-500 hover:bg-green-600 text-white border-none shadow-sm">
                            Ativação Concluída
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Endereço e Coordenadas
              </h4>

              <ul className="space-y-3">
                <li className="flex flex-col text-sm py-2 border-b gap-1">
                  <span className="text-muted-foreground">Endereço Completo</span>
                  <span className="font-medium">
                    {localAsset.address || 'Endereço não cadastrado'}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Cidade / UF</span>
                  <span className="font-medium">
                    {localAsset.city || 'N/D'} {localAsset.uf_code ? `/ ${localAsset.uf_code}` : ''}
                  </span>
                </li>
                <li className="flex flex-col text-sm py-2 border-b gap-1">
                  <span className="text-muted-foreground">Coordenadas</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {localAsset.latitude && localAsset.longitude
                      ? `${localAsset.latitude}, ${localAsset.longitude}`
                      : 'N/D'}
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
