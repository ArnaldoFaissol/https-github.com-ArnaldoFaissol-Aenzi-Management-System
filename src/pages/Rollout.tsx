import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Route, Truck, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { getRolloutBacklog } from '@/services/assets'

export default function Rollout() {
  const [backlogSites, setBacklogSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRolloutBacklog().then((data) => {
      setBacklogSites(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
          Cronograma de Rollout
        </h1>
        <p className="text-muted-foreground">
          Visão logística e plano de implementação de infraestrutura de gabinetes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gantt Chart Mock */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Plano de 90 Dias</CardTitle>
            <CardDescription>Acompanhamento das fases macro de implementação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Fase 1: Setup Inicial (Concluído)</span>
                <span className="text-primary">100%</span>
              </div>
              <Progress value={100} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Estruturação de base de dados e integração IoT.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Fase 2: Piloto SP/MG (Em andamento)</span>
                <span className="text-primary">80%</span>
              </div>
              <Progress value={80} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Implantação dos primeiros 20 gabinetes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Fase 3: Escala Nacional (Pendente)</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground">Expansão para 4.000 sites até Q4.</p>
            </div>
          </CardContent>
        </Card>

        {/* Route Optimizer Panel */}
        <Card className="bg-secondary text-secondary-foreground shadow-elevation border-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5 text-primary" />
              Otimizador de Rotas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-secondary-foreground/80">
              O algoritmo de roteamento logístico identificou oportunidades de redução de custo de
              frete na próxima remessa.
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

      <h2 className="text-xl font-semibold mt-4">Gestão de Backlog (SLA ≤ 45 dias)</h2>
      {loading ? (
        <div className="flex h-32 items-center justify-center border rounded-lg bg-card/50">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {backlogSites.map((site, i) => {
            const daysLeft = site.target_date
              ? Math.max(
                  0,
                  Math.floor(
                    (new Date(site.target_date).getTime() - new Date().getTime()) /
                      (1000 * 3600 * 24),
                  ),
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
    </div>
  )
}
