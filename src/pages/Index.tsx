import { useEffect, useMemo, useState } from 'react'
import { FinancialCards } from '@/components/dashboard/FinancialCards'
import { StrategicMap } from '@/components/dashboard/StrategicMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Info, Loader2 } from 'lucide-react'
import { getAssets } from '@/services/assets'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

const SLA_TARGET_DAYS = Number(localStorage.getItem('sys_sla_target') ?? '45')
const UPTIME_TARGET = Number(localStorage.getItem('sys_uptime_target') ?? '99.5')
const OPEX_RATE = Number(localStorage.getItem('sys_opex_rate') ?? '30') / 100

/** Build KPI rows dynamically from the live asset data. */
function buildKpis(assets: any[]) {
  const total = assets.length
  const active = assets.filter((a) => a.is_active).length
  const backlog = assets.filter((a) => !a.is_active && !a.is_in_stock).length

  const uptimeAvg =
    total > 0
      ? assets.reduce((s, a) => s + (Number(a.uptime) || 0), 0) / total
      : 0

  const mttrValues = assets
    .map((a) => Number(a.mttr_hours))
    .filter((n) => !Number.isNaN(n) && n > 0)
  const mttrAvg = mttrValues.length > 0 ? mttrValues.reduce((s, n) => s + n, 0) / mttrValues.length : 0

  const monthlyRevenue = assets.reduce((s, a) => s + (Number(a.monthly_revenue) || 0), 0)
  const contractValue = assets.reduce((s, a) => s + (Number(a.contract_value) || 0), 0)
  const netMonthly = monthlyRevenue * (1 - OPEX_RATE)
  const roiAnnualPct = contractValue > 0 ? ((netMonthly * 12) / contractValue) * 100 : 0

  const fmtPct = (n: number) => `${n.toFixed(1)}%`
  const fmtH = (n: number) => (n > 0 ? `${n.toFixed(1)}h` : '—')
  const fmtBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)

  type KpiStatus = 'success' | 'warning' | 'danger'
  const ok = (v: boolean): KpiStatus => (v ? 'success' : 'danger')

  return [
    {
      metric: 'Ativos Operacionais',
      current: `${active} / ${total}`,
      target: total > 0 ? `${((active / total) * 100).toFixed(0)}%` : '—',
      status: ok(total > 0 && active / total >= 0.8),
    },
    {
      metric: 'Uptime Médio',
      current: fmtPct(uptimeAvg),
      target: `≥ ${fmtPct(UPTIME_TARGET)}`,
      status: ok(uptimeAvg >= UPTIME_TARGET),
    },
    {
      metric: 'MTTR Médio',
      current: fmtH(mttrAvg),
      target: '≤ 4h',
      status: mttrAvg === 0 ? 'warning' : ok(mttrAvg <= 4),
    },
    {
      metric: 'Receita Recorrente (MRR)',
      current: fmtBRL(monthlyRevenue),
      target: fmtBRL(monthlyRevenue),
      status: monthlyRevenue > 0 ? 'success' : 'warning',
    },
    {
      metric: 'ROI Anual Projetado',
      current: fmtPct(roiAnnualPct),
      target: '≥ 20%',
      status: ok(roiAnnualPct >= 20),
    },
    {
      metric: 'Backlog (SLA alvo)',
      current: `${backlog} ativos`,
      target: `≤ ${SLA_TARGET_DAYS}d`,
      status: backlog === 0 ? 'success' : backlog < 10 ? 'warning' : 'danger',
    },
  ] satisfies Array<{ metric: string; current: string; target: string; status: KpiStatus }>
}

function buildCeoSummary(assets: any[], user?: { name?: string } | null) {
  const total = assets.length
  const active = assets.filter((a) => a.is_active).length
  const backlog = assets.filter((a) => !a.is_active && !a.is_in_stock).length
  const inStock = assets.filter((a) => a.is_in_stock).length
  const ufs = Array.from(new Set(assets.map((a) => a.uf_code).filter(Boolean)))

  const greeting = user?.name ? `Olá ${user.name.split(' ')[0]}.` : 'Resumo da operação.'
  const body =
    total === 0
      ? 'Ainda não há ativos cadastrados na plataforma. Importe um CSV em /assets para começar.'
      : `A plataforma tem ${total} ativos cadastrados em ${ufs.length || 0} UFs` +
        ` — ${active} operacionais, ${backlog} em backlog${inStock > 0 ? ` e ${inStock} em estoque` : ''}.`

  const action =
    backlog > 0
      ? `Aprovar o rollout dos ${backlog} sites em backlog para reduzir o lead-time médio abaixo de ${SLA_TARGET_DAYS} dias.`
      : total > 0
        ? 'Todos os ativos foram ativados. Foco agora em otimizar uptime e receita recorrente.'
        : 'Importe os ativos via CSV para habilitar os KPIs dinâmicos.'

  return { greeting, body, action }
}

export default function Index() {
  const { user } = useAuth()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const data = await getAssets()
    setAssets(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('assets', () => {
    loadData()
  })

  const kpis = useMemo(() => buildKpis(assets), [assets])
  const summary = useMemo(() => buildCeoSummary(assets, user), [assets, user])

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Resumo Executivo</h1>
        <p className="text-muted-foreground">
          Visão geral da operação e saúde financeira da plataforma Skip.
        </p>
      </div>

      <FinancialCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 h-full flex flex-col">
          <StrategicMap />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card className="shadow-sm border-border/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">KPI Baseline vs. Meta (Skip)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Métrica</TableHead>
                      <TableHead>Atual</TableHead>
                      <TableHead className="text-right">Meta Skip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpis.map((kpi, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-sm">{kpi.metric}</TableCell>
                        <TableCell className="text-muted-foreground">{kpi.current}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              kpi.status === 'success'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : kpi.status === 'warning'
                                  ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                            }
                          >
                            {kpi.target}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Resumo para o CEO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-secondary-foreground/80 mb-4">
                <span className="font-medium">{summary.greeting}</span> {summary.body}
              </p>
              <div className="bg-background/10 p-3 rounded-md border border-white/10">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                  Ação Imediata Recomendada
                </span>
                <span className="text-sm">{summary.action}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
