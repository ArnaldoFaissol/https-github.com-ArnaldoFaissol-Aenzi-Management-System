import { RevenueChart } from '@/components/billing/RevenueChart'
import { PaybackCalculator } from '@/components/billing/PaybackCalculator'
import { Card, CardContent } from '@/components/ui/card'
import { Zap } from 'lucide-react'

export default function Billing() {
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

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <PaybackCalculator />
      </div>

      <Card className="bg-primary/5 border border-primary/20 shadow-none">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
              Engine de Faturamento via kWh Ativa
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O sistema atualmente lê a telemetria diária dos 16 sites operacionais, calculando o
              custo automaticamente e gerando o faturamento (Modelo DEINF). Para o fechamento de
              Junho, projeta-se R$ 92.000 (R$ 55k SP, R$ 37k MG) baseado na régua de R$1.3k a R$4.0k
              por gabinete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
