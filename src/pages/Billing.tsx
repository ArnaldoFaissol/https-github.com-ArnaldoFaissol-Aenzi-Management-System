import { useEffect, useState } from 'react'
import { RevenueChart } from '@/components/billing/RevenueChart'
import { PaybackCalculator } from '@/components/billing/PaybackCalculator'
import { FinancialCards } from '@/components/dashboard/FinancialCards'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, Loader2 } from 'lucide-react'
import { getBillingCycles } from '@/services/billing'

export default function Billing() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBillingCycles().then((cycles) => {
      // Process data for chart
      const processed = cycles.reduce((acc: any, curr: any) => {
        const month = curr.month.substring(0, 7) // YYYY-MM
        if (!acc[month]) acc[month] = { month, SP: 0, MG: 0 }
        if (curr.region === 'SP') acc[month].SP += Number(curr.revenue)
        if (curr.region === 'MG') acc[month].MG += Number(curr.revenue)
        return acc
      }, {})

      const chartData = Object.values(processed).sort((a: any, b: any) =>
        a.month.localeCompare(b.month),
      )
      setData(chartData)
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

  const totalRevenue = data.reduce((acc, curr) => acc + curr.SP + curr.MG, 0)

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
          Faturamento & ROI
        </h1>
        <p className="text-muted-foreground">
          Engine de faturamento IoT e projeções de retorno sobre investimento.
        </p>
      </div>

      <FinancialCards totalRevenue={totalRevenue} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={data} />
        <PaybackCalculator />
      </div>

      <Card className="bg-primary/5 border border-primary/20 shadow-none">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              Engine de Faturamento via kWh Ativa (Tempo Real)
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O sistema atualmente lê a telemetria diária dos sites operacionais conectados,
              calculando o custo automaticamente e gerando o faturamento (Modelo DEINF). Para o
              fechamento atual, a receita acumulada é de R$ {totalRevenue.toLocaleString('pt-BR')}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
