import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Asset } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Activity, Battery, Calendar, Clock, DollarSign, MapPin, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Props {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetDetailSheet({ asset, open, onOpenChange }: Props) {
  if (!asset) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mt-4">
            <SheetTitle className="text-2xl">{asset.name}</SheetTitle>
            <Badge
              variant="outline"
              className={
                asset.status === 'Operational'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : asset.status === 'Maintenance'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-muted text-muted-foreground'
              }
            >
              {asset.status}
            </Badge>
          </div>
          <SheetDescription className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            Região: {asset.region} | ID: {asset.id}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6">
          {/* IoT Real-time Data */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Telemetria em Tempo Real
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded-lg border">
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <Zap className="h-3.5 w-3.5" /> Consumo
                </span>
                <span className="font-mono text-lg font-medium">{asset.kwh} kWh</span>
              </div>
              <div className="bg-muted p-3 rounded-lg border">
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <DollarSign className="h-3.5 w-3.5" /> Receita/Mês
                </span>
                <span className="font-mono text-lg font-medium text-primary">
                  R$ {asset.revenue.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg border space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Battery className="h-4 w-4" /> Nível da Bateria
                </span>
                <span className="font-medium">{asset.batteryLevel}%</span>
              </div>
              <Progress
                value={asset.batteryLevel}
                className="h-2"
                indicatorClassName={asset.batteryLevel > 20 ? 'bg-primary' : 'bg-destructive'}
              />
            </div>
          </div>

          <Separator />

          {/* Technical History */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Histórico Técnico
            </h4>

            <ul className="space-y-3">
              <li className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Data de Instalação</span>
                <span className="font-medium">{asset.installDate}</span>
              </li>
              <li className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Uptime Geral</span>
                <span className="font-medium">{asset.uptime}%</span>
              </li>
              <li className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> MTTR Recente
                </span>
                <span className="font-medium text-destructive">{asset.mttr}</span>
              </li>
            </ul>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm mt-4">
              <p className="font-medium text-primary mb-1">Último Log de Manutenção</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Retrator substituído após alerta de travamento preventivo via sensor IoT. Operação
                concluída em 45 min.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
