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
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Props {
  asset: any | null
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
            <SheetTitle className="text-2xl">{asset.asset_name}</SheetTitle>
            <Badge
              variant="outline"
              className={
                asset.asset_status === 'Operacional' || asset.asset_status === 'Ativo'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : asset.asset_status === 'Manutenção'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-muted text-muted-foreground'
              }
            >
              {asset.asset_status}
            </Badge>
          </div>
          <SheetDescription className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            Região: {asset.region} {asset.uf_code ? `(${asset.uf_code})` : ''} | ID:{' '}
            {asset.fcu_code}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="technical">Técnico</TabsTrigger>
            <TabsTrigger value="location">Local.</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            {/* IoT Real-time Data */}
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
                  <span className="font-mono text-lg font-medium">{asset.kwh_total || 0} kWh</span>
                </div>
                <div className="bg-muted p-3 rounded-lg border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <DollarSign className="h-3.5 w-3.5" /> Receita/Mês
                  </span>
                  <span className="font-mono text-lg font-medium text-primary">
                    R$ {(asset.contract_value || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg border space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Battery className="h-4 w-4" /> Nível da Bateria
                  </span>
                  <span className="font-medium">{asset.battery_level || 0}%</span>
                </div>
                <Progress
                  value={asset.battery_level || 0}
                  className="h-2"
                  indicatorClassName={
                    (asset.battery_level || 0) > 20 ? 'bg-primary' : 'bg-destructive'
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
                    {asset.installation_date
                      ? new Date(asset.installation_date).toLocaleDateString('pt-BR')
                      : 'Pendente'}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Uptime Geral</span>
                  <span className="font-medium">{asset.uptime || 0}%</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> MTTR Recente
                  </span>
                  <span className="font-medium text-destructive">
                    {asset.mttr_hours || 'N/A'} h
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
                  <span className="font-medium">{asset.cabinet_type || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">SN Bastidor</span>
                  <span className="font-medium">{asset.rack_serial_number || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Tipo de Rede</span>
                  <span className="font-medium flex items-center gap-1">
                    <Network className="h-3.5 w-3.5" /> {asset.network_type || 'N/D'}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Qtd. Baterias</span>
                  <span className="font-medium">{asset.battery_count ?? 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Qtd. Retificadores</span>
                  <span className="font-medium">{asset.rectifier_count ?? 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Especificação SRs</span>
                  <span className="font-medium">{asset.sr_specification || 'N/D'}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Segurança e Acesso
              </h4>

              <ul className="space-y-3">
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Cadeado Bluetooth</span>
                  <span className="font-medium">{asset.bluetooth_lock_status || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Chave do Bastidor</span>
                  <span className="font-medium">{asset.rack_key_info || 'N/D'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Detentor</span>
                  <span className="font-medium">{asset.holder || 'N/D'}</span>
                </li>
              </ul>
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
                  <span className="font-medium">{asset.address || 'Endereço não cadastrado'}</span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Cidade / UF</span>
                  <span className="font-medium">
                    {asset.city || 'N/D'} {asset.uf_code ? `/ ${asset.uf_code}` : ''}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Regional</span>
                  <span className="font-medium">{asset.region || 'N/D'}</span>
                </li>
                <li className="flex flex-col text-sm py-2 border-b gap-1">
                  <span className="text-muted-foreground">Coordenadas (Raw)</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {asset.coordinates_raw ||
                      (asset.latitude ? `${asset.latitude}, ${asset.longitude}` : 'N/D')}
                  </span>
                </li>
                <li className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Cadastro IAMS</span>
                  <span className="font-medium flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" /> {asset.iams_registration || 'N/D'}
                  </span>
                </li>
              </ul>
            </div>

            {asset.latitude && asset.longitude && (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center border mt-4">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Mapa indisponível (Mock)
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
