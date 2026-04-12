import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Route, Truck, Loader2, GripVertical, MapPin } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getRolloutBacklog,
  getAssetsForKanban,
  updateAssetStep,
  getRolloutStages,
} from '@/services/assets'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import ManageColumnsSheet from '@/components/rollout/ManageColumnsSheet'

const KanbanCard = memo(
  ({
    asset,
    onDragStart,
  }: {
    asset: any
    onDragStart: (e: React.DragEvent, id: string) => void
  }) => (
    <Card
      className="p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-border/50 bg-background/80 backdrop-blur-sm"
      draggable
      onDragStart={(e) => onDragStart(e, asset.id)}
    >
      <div className="flex gap-2 items-start">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
        <div className="min-w-0 w-full">
          <div className="font-medium text-sm truncate" title={asset.asset_name}>
            {asset.asset_name}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">
            {asset.fcu_code || 'S/ID'}
          </div>
          {(asset.city || asset.uf_code) && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {asset.city} {asset.uf_code ? `/ ${asset.uf_code}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  ),
)
KanbanCard.displayName = 'KanbanCard'

export default function Rollout() {
  const [backlogSites, setBacklogSites] = useState<any[]>([])
  const [kanbanAssets, setKanbanAssets] = useState<any[]>([])
  const [activationSteps, setActivationSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin' || user?.role === 'superuser'

  const loadData = useCallback(() => {
    setLoading(true)
    Promise.all([getRolloutBacklog(), getAssetsForKanban(), getRolloutStages()]).then(
      ([backlog, assets, stages]) => {
        setBacklogSites(backlog)
        setKanbanAssets(assets || [])
        setActivationSteps(stages || [])
        setLoading(false)
      },
    )
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('assets', () => {
    getAssetsForKanban().then((assets) => setKanbanAssets(assets || []))
  })

  useRealtime('rollout_stages', () => {
    getRolloutStages().then((stages) => setActivationSteps(stages || []))
  })

  const groupedAssets = useMemo(() => {
    const groups: Record<string, any[]> = {}
    activationSteps.forEach((s) => (groups[s.id] = []))
    kanbanAssets.forEach((a) => {
      let step = activationSteps.find((s) => s.id === a.step_number || s.name === a.process_status)
      if (!step && activationSteps.length > 0) step = activationSteps[0]
      if (step) {
        if (!groups[step.id]) groups[step.id] = []
        groups[step.id].push(a)
      }
    })
    return groups
  }, [kanbanAssets, activationSteps])

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string) => e.dataTransfer.setData('assetId', id),
    [],
  )
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, stepId: string, processStatus: string) => {
      e.preventDefault()
      const assetId = e.dataTransfer.getData('assetId')
      if (!assetId) return
      const asset = kanbanAssets.find((a) => a.id === assetId)
      if (asset && (asset.process_status !== processStatus || asset.step_number !== stepId)) {
        setKanbanAssets((prev) =>
          prev.map((a) =>
            a.id === assetId ? { ...a, step_number: stepId, process_status: processStatus } : a,
          ),
        )
        try {
          await updateAssetStep(assetId, stepId, processStatus)
          toast({
            title: 'Etapa atualizada com sucesso',
            description: 'Ativo movido para a etapa selecionada',
          })
        } catch (err) {
          toast({ title: 'Erro ao mover ativo', variant: 'destructive' })
          loadData()
        }
      }
    },
    [kanbanAssets, toast, loadData],
  )

  return (
    <div className="flex flex-col gap-6 animate-slide-up h-[calc(100vh-80px)]">
      <Tabs defaultValue="kanban" className="flex flex-col h-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="flex flex-col items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
                Rollout e Ativação
              </h1>
              <p className="text-muted-foreground">
                Acompanhamento do cronograma logístico e pipeline de ativação.
              </p>
            </div>
            {isAdmin && <ManageColumnsSheet stages={activationSteps} onUpdated={loadData} />}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto self-end sm:self-auto">
            <TabsList>
              <TabsTrigger value="kanban">Kanban de Ativação</TabsTrigger>
              <TabsTrigger value="overview">Visão Logística</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="kanban" className="flex-1 mt-6 min-h-0 m-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center border rounded-lg bg-card/50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 h-full snap-x will-change-scroll">
              {activationSteps.map((step) => {
                const stepAssets = groupedAssets[step.id] || []
                return (
                  <div
                    key={step.id}
                    className="min-w-[300px] w-[300px] bg-secondary/30 rounded-xl p-4 flex flex-col snap-start border border-border/50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, step.id, step.name)}
                  >
                    <div className="flex justify-between items-start mb-4 shrink-0">
                      <div>
                        <h3
                          className="font-semibold text-sm line-clamp-2"
                          title={`${step.name} (${step.responsibility || 'Sem responsável'})`}
                        >
                          {step.name}{' '}
                          <span className="text-muted-foreground font-normal">
                            ({step.responsibility || 'N/A'})
                          </span>
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {stepAssets.length} ativos
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                      {stepAssets.map((asset) => (
                        <KanbanCard key={asset.id} asset={asset} onDragStart={handleDragStart} />
                      ))}
                      {stepAssets.length === 0 && (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg">
                          <span className="text-xs text-muted-foreground">Arraste para cá</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {activationSteps.length === 0 && (
                <div className="w-[300px] h-full flex flex-col items-center justify-center text-muted-foreground gap-2 border-2 border-dashed rounded-xl border-border/50 p-6 text-center">
                  <p className="font-medium text-sm">Nenhuma etapa configurada</p>
                  {isAdmin && (
                    <p className="text-xs">
                      Use o botão "Gerenciar Colunas" acima para adicionar novas etapas ao Kanban.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overview" className="mt-6 space-y-6 m-0 pb-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Plano de 90 Dias</CardTitle>
                <CardDescription>Acompanhamento das fases macro de implementação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: 'Fase 1: Setup Inicial (Concluído)',
                    progress: 100,
                    desc: 'Estruturação de base de dados e integração IoT.',
                    color: 'text-primary',
                  },
                  {
                    title: 'Fase 2: Piloto SP/MG (Em andamento)',
                    progress: 80,
                    desc: 'Implantação dos primeiros 20 gabinetes.',
                    color: 'text-primary',
                  },
                  {
                    title: 'Fase 3: Escala Nacional (Pendente)',
                    progress: 0,
                    desc: 'Expansão para 4.000 sites até Q4.',
                    color: 'text-muted-foreground',
                  },
                ].map((phase, i) => (
                  <div key={i} className="space-y-2">
                    <div
                      className={`flex justify-between text-sm font-medium ${phase.progress === 0 ? 'text-muted-foreground' : ''}`}
                    >
                      <span>{phase.title}</span>
                      <span className={phase.color}>{phase.progress}%</span>
                    </div>
                    <Progress
                      value={phase.progress}
                      className={`h-3 ${phase.progress === 0 ? 'bg-muted' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">{phase.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-secondary text-secondary-foreground shadow-elevation border-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Route className="h-5 w-5 text-primary" />
                  Otimizador de Rotas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-secondary-foreground/80">
                  O algoritmo de roteamento logístico identificou oportunidades de redução de custo
                  de frete na próxima remessa.
                </p>
                <div className="bg-background/10 p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary mb-1">
                    Economia Projetada
                  </span>
                  <span className="text-3xl font-bold tracking-tight">15.4%</span>
                  <span className="text-xs text-secondary-foreground/60 mt-1">
                    R$ 1.200/viagem economizados
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-foreground/80 mt-2">
                  <Truck className="h-4 w-4" />
                  <span>Próxima rota otimizada: SP → Campinas</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            Gestão de Backlog Logístico (SLA ≤ 45 dias)
          </h2>
          {loading ? (
            <div className="flex h-32 items-center justify-center border rounded-lg bg-card/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {backlogSites.map((site) => {
                const daysLeft = site.target_date
                  ? Math.max(
                      0,
                      Math.floor((new Date(site.target_date).getTime() - Date.now()) / 86400000),
                    )
                  : 45
                const isDanger = daysLeft < 10
                return (
                  <Card
                    key={site.id}
                    className="shadow-sm border-border/50 relative overflow-hidden group hover:border-primary/50 transition-colors"
                  >
                    <div
                      className={`absolute top-0 left-0 w-1 h-full ${isDanger ? 'bg-destructive' : 'bg-primary'}`}
                    />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {site.site_id}
                          </span>
                          <h3 className="font-medium leading-none">{site.site_name}</h3>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {site.region}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-4 pt-4 border-t">
                        <Clock
                          className={`h-4 w-4 ${isDanger ? 'text-destructive' : 'text-muted-foreground'}`}
                        />
                        <span
                          className={
                            isDanger ? 'text-destructive font-medium' : 'text-muted-foreground'
                          }
                        >
                          SLA: {daysLeft} dias restantes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
