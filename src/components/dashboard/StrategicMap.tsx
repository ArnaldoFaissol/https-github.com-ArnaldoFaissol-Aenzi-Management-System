import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Target } from 'lucide-react'
import { getAssets } from '@/services/assets'
import { useRealtime } from '@/hooks/use-realtime'

export function StrategicMap() {
  const [assets, setAssets] = useState<any[]>([])

  const loadData = () => {
    getAssets().then(setAssets)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('assets', () => {
    loadData()
  })

  const stats = useMemo(() => {
    const active = assets.filter((a) => a.is_active).length
    const backlog = assets.filter((a) => !a.is_active && !a.is_in_stock).length

    // Geolocation metrics approximation using uf_code to demonstrate dynamic rendering
    const spCount = assets.filter((a) => a.uf_code === 'SP').length
    const mgCount = assets.filter((a) => a.uf_code === 'MG').length
    const rjCount = assets.filter((a) => a.uf_code === 'RJ').length
    const othersCount = assets.filter(
      (a) => a.uf_code && !['SP', 'MG', 'RJ'].includes(a.uf_code),
    ).length

    return { active, backlog, spCount, mgCount, rjCount, othersCount }
  }, [assets])

  return (
    <Card className="h-full shadow-sm border-border/50 flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mapa Estratégico & Ativos Logísticos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative bg-muted/20 min-h-[300px] overflow-hidden rounded-b-xl">
        {/* Map Grid Background */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Dynamic Markers based on Real Data */}
        {stats.spCount > 0 && (
          <div
            className="absolute top-[60%] left-[40%] flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20" />
              <div className="h-4 w-4 bg-primary rounded-full border-[3px] border-background shadow-md z-10" />
            </div>
            <span className="text-[11px] font-semibold bg-background/90 px-2.5 py-1 rounded shadow-md mt-1 backdrop-blur-sm border border-border">
              SP: {stats.spCount}
            </span>
          </div>
        )}

        {stats.mgCount > 0 && (
          <div
            className="absolute top-[40%] left-[55%] flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="h-3.5 w-3.5 bg-primary rounded-full border-[2.5px] border-background shadow-md z-10" />
            </div>
            <span className="text-[11px] font-semibold bg-background/90 px-2.5 py-1 rounded shadow-md mt-1 backdrop-blur-sm border border-border">
              MG: {stats.mgCount}
            </span>
          </div>
        )}

        {stats.rjCount > 0 && (
          <div
            className="absolute top-[55%] left-[65%] flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="h-3.5 w-3.5 bg-primary/70 rounded-full border-[2.5px] border-background shadow-md z-10" />
            </div>
            <span className="text-[11px] font-semibold bg-background/90 px-2.5 py-1 rounded shadow-md mt-1 backdrop-blur-sm border border-border">
              RJ: {stats.rjCount}
            </span>
          </div>
        )}

        {stats.othersCount > 0 && (
          <div
            className="absolute top-[25%] left-[30%] flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="h-3.5 w-3.5 bg-secondary rounded-full border-[2.5px] border-background shadow-md z-10" />
            </div>
            <span className="text-[11px] font-semibold bg-background/90 px-2.5 py-1 rounded shadow-md mt-1 backdrop-blur-sm border border-border">
              Outros: {stats.othersCount}
            </span>
          </div>
        )}

        {assets.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground animate-fade-in">
            <Target className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Aguardando telemetria de ativos...</p>
          </div>
        )}

        {/* Backlog Legend */}
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-md border p-3.5 rounded-lg shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Status da Operação
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
              {stats.active} Operacionais
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-muted border border-muted-foreground/40" />
              {stats.backlog} Em Backlog
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
