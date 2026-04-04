import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, Target, Activity } from 'lucide-react'

export function FinancialCards({ totalRevenue = 92000 }: { totalRevenue?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-elevation overflow-hidden relative">
        <div className="absolute -right-4 -top-4 bg-white/10 h-24 w-24 rounded-full blur-2xl" />
        <CardHeader className="pb-2">
          <CardTitle className="text-primary-foreground/80 text-sm font-medium flex items-center justify-between">
            Receita Acumulada (2025)
            <DollarSignIcon className="h-4 w-4 opacity-70" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight mb-1">
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </div>
          <p className="text-sm text-primary-foreground/90 flex items-center gap-1">
            <ArrowUpRight className="h-4 w-4" />
            +10% (Skip-Optimized)
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium flex items-center justify-between">
            Tracker de ROI (Payback)
            <Target className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground mb-2">
            8.5 <span className="text-lg text-muted-foreground font-normal">Meses</span>
          </div>
          <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[70%] rounded-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Meta: 6 a 12 meses</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium flex items-center justify-between">
            TIR (Taxa Interna de Retorno)
            <Activity className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground mb-1">26.4%</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
              <div className="absolute top-1/2 -translate-y-1/2 left-[60%] w-3 h-3 bg-white border-2 border-foreground rounded-full shadow-sm" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Dentro da faixa segura (19-33%)</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
