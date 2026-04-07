import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export function BRGAAPStatement({ data }: { data: any[] }) {
  const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
  const totalTaxes = data.reduce((sum, item) => sum + Number(item.taxes || 0), 0)
  const totalDeductions = data.reduce((sum, item) => sum + Number(item.deductions || 0), 0)
  const totalOpex = data.reduce((sum, item) => sum + Number(item.opex || 0), 0)

  const netRevenue = totalRevenue - totalTaxes - totalDeductions
  const ebitda = netRevenue - totalOpex
  const margin = netRevenue > 0 ? (ebitda / netRevenue) * 100 : 0

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <Card className="shadow-sm border-border/50 h-full flex flex-col">
      <CardHeader>
        <CardTitle>DRE Consolidada - BR GAAP</CardTitle>
        <CardDescription>
          Demonstração do Resultado do Exercício consolidada para a operação de ativos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[250px] md:w-[300px]">Conta Contábil</TableHead>
                <TableHead className="text-right">Valor Consolidado</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Análise Vertical (%)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">
                  Receita Operacional Bruta
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(totalRevenue)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                  100,00%
                </TableCell>
              </TableRow>
              <TableRow className="text-muted-foreground">
                <TableCell className="pl-4 sm:pl-8">(-) Impostos Incidentes</TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(totalTaxes)}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell">
                  {totalRevenue > 0 ? ((totalTaxes / totalRevenue) * 100).toFixed(2) : '0,00'}%
                </TableCell>
              </TableRow>
              <TableRow className="text-muted-foreground">
                <TableCell className="pl-4 sm:pl-8">(-) Deduções e Devoluções</TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(totalDeductions)}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell">
                  {totalRevenue > 0 ? ((totalDeductions / totalRevenue) * 100).toFixed(2) : '0,00'}%
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/20">
                <TableCell className="font-semibold text-foreground">
                  (=) Receita Operacional Líquida
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatCurrency(netRevenue)}
                </TableCell>
                <TableCell className="text-right font-medium hidden sm:table-cell">
                  {totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100).toFixed(2) : '0,00'}%
                </TableCell>
              </TableRow>
              <TableRow className="text-muted-foreground">
                <TableCell className="pl-4 sm:pl-8">(-) Custos Operacionais (OPEX)</TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(totalOpex)}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell">
                  {totalRevenue > 0 ? ((totalOpex / totalRevenue) * 100).toFixed(2) : '0,00'}%
                </TableCell>
              </TableRow>
              <TableRow className="bg-primary/5">
                <TableCell className="font-bold text-primary">
                  (=) EBITDA (Resultado Operacional)
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-bold',
                    ebitda >= 0 ? 'text-primary' : 'text-destructive',
                  )}
                >
                  {formatCurrency(ebitda)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary hidden sm:table-cell">
                  {margin.toFixed(2)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
