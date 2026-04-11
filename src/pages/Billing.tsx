import { useEffect, useState } from 'react'
import { RevenueChart } from '@/components/billing/RevenueChart'
import { PaybackCalculator } from '@/components/billing/PaybackCalculator'
import { BRGAAPStatement } from '@/components/billing/BRGAAPStatement'
import { CabinetDrillDown } from '@/components/billing/CabinetDrillDown'
import { FinancialCards } from '@/components/dashboard/FinancialCards'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Loader2, FileSpreadsheet, Network } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getBillingCycles } from '@/services/billing'

export default function Billing() {
  const [data, setData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBillingCycles().then((cycles) => {
      setData(cycles)

      const processed = cycles.reduce((acc: any, curr: any) => {
        const month = curr.month.substring(0, 7) // YYYY-MM
        if (!acc[month]) acc[month] = { month, SP: 0, MG: 0 }
        if (curr.region === 'SP') acc[month].SP += Number(curr.revenue)
        if (curr.region === 'MG') acc[month].MG += Number(curr.revenue)
        return acc
      }, {})

      const mappedChartData = Object.values(processed).sort((a: any, b: any) =>
        a.month.localeCompare(b.month),
      )
      setChartData(mappedChartData)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalRevenue = data.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0)

  return (
    <div className="flex flex-col gap-6 animate-slide-up pb-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Faturamento & ROI Contábil
          </h1>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Skip Cloud Sync
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Demonstrações Financeiras (BR GAAP) e análise de performance por ativo.
        </p>
      </div>

      <FinancialCards totalRevenue={totalRevenue} />

      <Tabs defaultValue="brgaap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] h-auto p-1">
          <TabsTrigger value="brgaap" className="flex gap-2 py-2">
            <FileSpreadsheet className="h-4 w-4 hidden sm:block" /> DRE (BR GAAP)
          </TabsTrigger>
          <TabsTrigger value="drilldown" className="flex gap-2 py-2">
            <Network className="h-4 w-4 hidden sm:block" /> Drill-down Ativos
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex gap-2 py-2">
            <Zap className="h-4 w-4 hidden sm:block" /> Simulador ROI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brgaap" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <BRGAAPStatement data={data} />
            <RevenueChart data={chartData} />
          </div>
        </TabsContent>

        <TabsContent value="drilldown" className="space-y-6">
          <CabinetDrillDown data={data} />
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <PaybackCalculator />

            <Card className="bg-primary/5 border border-primary/20 shadow-none h-full">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Engine de Faturamento & ROI Dinâmico
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    O simulador ao lado permite estimar o tempo de retorno (Payback) baseado em
                    variáveis hipotéticas de CAPEX e OPEX, ajudando a traçar metas de eficiência.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Já na aba <strong>Drill-down Ativos</strong>, o sistema calcula o ROI real de
                    cada gabinete cruzando os dados reais de implantação com as margens operacionais
                    (EBITDA) geradas por telemetria e contratos ativos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
