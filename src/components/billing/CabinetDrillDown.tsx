import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { BarChart3, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CabinetDrillDown({ data }: { data: any[] }) {
  const [selectedCabinet, setSelectedCabinet] = useState<any | null>(null)

  const cabinetsMap = data
    .filter((c) => c.asset_id && c.assets)
    .reduce(
      (acc, curr) => {
        const fcu = curr.assets.fcu_code
        if (!acc[fcu]) {
          acc[fcu] = {
            fcu_code: fcu,
            asset_name: curr.assets.asset_name,
            region: curr.assets.region,
            contract_value: Number(curr.assets.contract_value || 0),
            revenue: 0,
            taxes: 0,
            deductions: 0,
            opex: 0,
            history: [],
          }
        }
        acc[fcu].revenue += Number(curr.revenue || 0)
        acc[fcu].taxes += Number(curr.taxes || 0)
        acc[fcu].deductions += Number(curr.deductions || 0)
        acc[fcu].opex += Number(curr.opex || 0)
        acc[fcu].history.push(curr)
        return acc
      },
      {} as Record<string, any>,
    )

  const cabinets = Object.values(cabinetsMap)
    .map((cab: any) => {
      const netRevenue = cab.revenue - cab.taxes - cab.deductions
      const ebitda = netRevenue - cab.opex
      const margin = netRevenue > 0 ? (ebitda / netRevenue) * 100 : 0
      const roi = cab.contract_value > 0 ? (ebitda / cab.contract_value) * 100 : 0

      const months = cab.history.length || 1
      const avgEbitda = ebitda / months
      const paybackMonths =
        avgEbitda > 0 && cab.contract_value > 0 ? cab.contract_value / avgEbitda : 0
      const isBreakEven = ebitda >= cab.contract_value && cab.contract_value > 0

      return { ...cab, netRevenue, ebitda, margin, roi, paybackMonths, isBreakEven }
    })
    .sort((a, b) => b.ebitda - a.ebitda)

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <>
      <Card className="shadow-sm border-border/50 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Drill-down por Gabinete
          </CardTitle>
          <CardDescription>
            Análise detalhada de performance financeira, ROI e Payback por unidade operacional
            (Ativo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Código FCU</TableHead>
                  <TableHead className="min-w-[150px]">Ativo</TableHead>
                  <TableHead className="text-right min-w-[120px]">CAPEX</TableHead>
                  <TableHead className="text-right min-w-[120px]">EBITDA Acum.</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-center min-w-[130px]">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cabinets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                      Nenhum dado financeiro vinculado a gabinetes foi encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {cabinets.map((cab) => (
                  <TableRow key={cab.fcu_code}>
                    <TableCell className="font-mono text-xs">{cab.fcu_code}</TableCell>
                    <TableCell className="font-medium">{cab.asset_name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(cab.contract_value)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        cab.ebitda >= 0 ? 'text-primary' : 'text-destructive',
                      )}
                    >
                      {formatCurrency(cab.ebitda)}
                    </TableCell>
                    <TableCell className="text-right">{cab.margin.toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-semibold">
                      {cab.roi.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {cab.isBreakEven ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          Break-even
                        </Badge>
                      ) : cab.ebitda > 0 ? (
                        <Badge
                          variant="secondary"
                          className="text-amber-600 bg-amber-100 hover:bg-amber-200 border-amber-200"
                        >
                          Em Recuperação
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Deficitário</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCabinet(cab)}>
                        Detalhes
                        <ArrowRight className="ml-2 h-4 w-4 hidden sm:inline-block" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCabinet} onOpenChange={(o) => !o && setSelectedCabinet(null)}>
        <SheetContent className="w-full sm:max-w-md lg:max-w-xl overflow-y-auto">
          {selectedCabinet && (
            <div className="space-y-6 pt-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">{selectedCabinet.fcu_code}</SheetTitle>
                <SheetDescription className="text-base">
                  {selectedCabinet.asset_name} • Região: {selectedCabinet.region}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    CAPEX (Implantação)
                  </p>
                  <p className="text-xl font-bold">
                    {formatCurrency(selectedCabinet.contract_value)}
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">EBITDA Acumulado</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(selectedCabinet.ebitda)}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">ROI Atual</p>
                  <p className="text-xl font-bold">{selectedCabinet.roi.toFixed(2)}%</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Payback Estimado</p>
                  <p className="text-xl font-bold">
                    {selectedCabinet.paybackMonths > 0
                      ? `${selectedCabinet.paybackMonths.toFixed(1)} meses`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">DRE Resumida (Acumulada)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Receita Bruta</span>
                    <span className="font-medium">{formatCurrency(selectedCabinet.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>(-) Impostos & Deduções</span>
                    <span>
                      -{formatCurrency(selectedCabinet.taxes + selectedCabinet.deductions)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Receita Líquida</span>
                    <span>{formatCurrency(selectedCabinet.netRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>(-) OPEX</span>
                    <span>-{formatCurrency(selectedCabinet.opex)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-2 border-t text-base">
                    <span>EBITDA</span>
                    <span>{formatCurrency(selectedCabinet.ebitda)}</span>
                  </div>
                </div>
              </div>

              {selectedCabinet.isBreakEven ? (
                <div className="p-4 bg-green-100 text-green-800 rounded-lg flex items-start gap-3 border border-green-200">
                  <TrendingUp className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Ativo em Zona de Lucro</p>
                    <p className="text-sm mt-1">
                      O EBITDA acumulado já superou o CAPEX investido neste gabinete.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3 border border-blue-200">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Buscando Break-even</p>
                    <p className="text-sm mt-1">
                      Falta{' '}
                      {formatCurrency(
                        Math.max(0, selectedCabinet.contract_value - selectedCabinet.ebitda),
                      )}{' '}
                      em EBITDA para cobrir o custo de implantação.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
