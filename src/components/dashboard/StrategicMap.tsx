import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { ACTIVE_SITES, BACKLOG_SITES } from '@/lib/mock-data'

export function StrategicMap() {
  return (
    <Card className="h-full shadow-sm border-border/50 flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mapa Estratégico (SP/MG)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative bg-muted/20 min-h-[300px] overflow-hidden">
        {/* Placeholder styling to simulate a map grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        ></div>

        {/* Mock Map Markers for SP */}
        <div
          className="absolute top-[60%] left-[30%] flex flex-col items-center animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
            <div className="h-4 w-4 bg-primary rounded-full border-2 border-white shadow-md z-10" />
          </div>
          <span className="text-[10px] font-semibold bg-background/80 px-2 py-0.5 rounded shadow-sm mt-1 backdrop-blur-sm border">
            SP: {ACTIVE_SITES.filter((s) => s.region === 'SP').length} Ativos
          </span>
        </div>

        {/* Mock Map Markers for MG */}
        <div
          className="absolute top-[30%] left-[60%] flex flex-col items-center animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="h-4 w-4 bg-primary rounded-full border-2 border-white shadow-md z-10" />
          </div>
          <span className="text-[10px] font-semibold bg-background/80 px-2 py-0.5 rounded shadow-sm mt-1 backdrop-blur-sm border">
            MG: {ACTIVE_SITES.filter((s) => s.region === 'MG').length} Ativos
          </span>
        </div>

        {/* Backlog Indicator */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur border p-3 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Visão Geral</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              {ACTIVE_SITES.length} Operacionais
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border border-muted-foreground"></span>
              {BACKLOG_SITES.length} Em Backlog
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
