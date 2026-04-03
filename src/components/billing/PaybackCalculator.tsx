import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Calculator } from 'lucide-react'

export function PaybackCalculator() {
  const [capex, setCapex] = useState(150000) // Total CAPEX
  const [savings, setSavings] = useState(25000) // Anuais
  const [opex, setOpex] = useState(5000) // Opex Skip

  // Payback = CAPEX / (Savings Anuais - Opex Skip)
  const netSavings = savings - opex
  const paybackYears = netSavings > 0 ? capex / netSavings : 0
  const paybackMonths = (paybackYears * 12).toFixed(1)

  return (
    <Card className="shadow-sm border-border/50 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Calculadora de Payback Dinâmica
        </CardTitle>
        <CardDescription>Simule o ROI baseado em metas de custo e eficiência</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>CAPEX Investido (R$)</span>
              <span className="font-mono text-primary">R$ {capex.toLocaleString('pt-BR')}</span>
            </div>
            <Slider
              value={[capex]}
              min={50000}
              max={500000}
              step={10000}
              onValueChange={(val) => setCapex(val[0])}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Economia Operacional Anual (R$)</span>
              <span className="font-mono text-primary">R$ {savings.toLocaleString('pt-BR')}</span>
            </div>
            <Slider
              value={[savings]}
              min={10000}
              max={100000}
              step={5000}
              onValueChange={(val) => setSavings(val[0])}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>OPEX Plataforma Skip (R$)</span>
              <span className="font-mono text-destructive">R$ {opex.toLocaleString('pt-BR')}</span>
            </div>
            <Slider
              value={[opex]}
              min={1000}
              max={20000}
              step={1000}
              onValueChange={(val) => setOpex(val[0])}
            />
          </div>
        </div>

        <div className="bg-muted p-5 rounded-xl border mt-auto text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Tempo de Retorno Estimado
          </p>
          {netSavings > 0 ? (
            <div className="text-4xl font-bold tracking-tight text-foreground">
              {paybackMonths}{' '}
              <span className="text-xl font-normal text-muted-foreground">meses</span>
            </div>
          ) : (
            <div className="text-xl font-bold text-destructive">OPEX excede Economia</div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Fórmula: CAPEX / (Economia Anual - OPEX Skip)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
