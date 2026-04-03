import { FinancialCards } from '@/components/dashboard/FinancialCards'
import { StrategicMap } from '@/components/dashboard/StrategicMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPI_BASELINE } from '@/lib/mock-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

export default function Index() {
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
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Métrica</TableHead>
                    <TableHead>Atual</TableHead>
                    <TableHead className="text-right">Meta Skip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {KPI_BASELINE.map((kpi, idx) => (
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
                Olá Arnaldo. A implantação da plataforma Skip mostra um avanço sólido na redução de
                perdas operacionais em SP e MG. A taxa de retenção projetada está em via de atingir
                +40% com a automação de faturamento.
              </p>
              <div className="bg-background/10 p-3 rounded-md border border-white/10">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                  Ação Imediata Recomendada
                </span>
                <span className="text-sm">
                  Aprovar o rollout dos 4 sites em backlog para reduzir o lead-time médio abaixo de
                  45 dias.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
