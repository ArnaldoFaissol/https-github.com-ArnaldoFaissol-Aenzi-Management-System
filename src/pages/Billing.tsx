import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, TrendingUp, Receipt, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { getAssets } from '@/services/assets'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'

const chartConfig = {
  revenue: { label: 'Receita Mensal (R$)', color: 'hsl(var(--chart-1))' },
  pendency: { label: 'Pendências Financeiras (R$)', color: 'hsl(var(--destructive))' },
}

export default function Billing() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    getAssets().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('assets', () => {
    loadData()
  })

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalContractValue = assets.reduce(
    (acc, curr) => acc + (Number(curr.contract_value) || 0),
    0,
  )
  const totalMonthlyRevenue = assets.reduce(
    (acc, curr) => acc + (Number(curr.monthly_revenue) || 0),
    0,
  )
  const totalPendencies = assets.reduce((acc, curr) => acc + (Number(curr.pendency) || 0), 0)

  // Opex assumed at 30% of revenue for ROI calculation as per executive standards
  const OPEX_RATE = 0.3
  const netMonthlyRevenue = totalMonthlyRevenue * (1 - OPEX_RATE)

  // Projected annual ROI calculation based on net monthly revenue and contract value
  const roi =
    totalContractValue > 0
      ? (((netMonthlyRevenue * 12) / totalContractValue) * 100).toFixed(2)
      : '0.00'

  // Aggregate financial data by UF for the chart
  const ufData = assets.reduce((acc: any, curr: any) => {
    const uf = curr.uf_code || 'N/D'
    if (!acc[uf]) acc[uf] = { uf, revenue: 0, pendency: 0 }
    acc[uf].revenue += Number(curr.monthly_revenue) || 0
    acc[uf].pendency += Number(curr.pendency) || 0
    return acc
  }, {})

  // Sort by highest revenue
  const chartData = Object.values(ufData).sort((a: any, b: any) => b.revenue - a.revenue)

  return (
    <div className="flex flex-col gap-6 animate-slide-up pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Faturamento & ROI</h1>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Skip Cloud DB
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Dashboard executivo de performance financeira, pendências de infraestrutura e retorno
          sobre investimento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Anual Projetado</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roi}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Retorno projetado s/ valor de contrato
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Contratos</CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              }).format(totalContractValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Soma do TCV (Total Contract Value)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Recorrente Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0,
              }).format(totalMonthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Geração de caixa bruta mensal estimada
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Receita vs Pendências por UF</CardTitle>
            <CardDescription>
              Resumo financeiro agregado por localidade operacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full mt-4">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="uf"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="font-medium"
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${value >= 1000 ? value / 1000 + 'k' : value}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-xs"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendency" fill="var(--color-pendency)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg mt-4">
                Dados financeiros insuficientes para gerar o gráfico.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Top Ativos por Rentabilidade</CardTitle>
            <CardDescription>
              Detalhamento de faturamento e pendências dos sites mais valiosos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden bg-card/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Ativo Técnico</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead className="text-right">Receita/Mês</TableHead>
                    <TableHead className="text-right">Pendências</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.filter((a) => Number(a.monthly_revenue) > 0 || Number(a.pendency) > 0)
                    .length > 0 ? (
                    assets
                      .filter((a) => Number(a.monthly_revenue) > 0 || Number(a.pendency) > 0)
                      .sort(
                        (a, b) =>
                          (Number(b.monthly_revenue) || 0) - (Number(a.monthly_revenue) || 0),
                      )
                      .slice(0, 7)
                      .map((asset) => (
                        <TableRow key={asset.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{asset.asset_name || 'Sem Nome'}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {asset.fcu_code}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {asset.uf_code || 'N/D'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Number(asset.monthly_revenue) || 0)}
                          </TableCell>
                          <TableCell className="text-right text-destructive font-medium">
                            {Number(asset.pendency) > 0
                              ? new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(Number(asset.pendency))
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        Nenhum dado financeiro de ativos disponível.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
