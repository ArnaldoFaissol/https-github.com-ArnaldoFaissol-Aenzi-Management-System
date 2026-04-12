import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Target } from 'lucide-react'
import { getAssets } from '@/services/assets'
import { useRealtime } from '@/hooks/use-realtime'

const BRAZIL_BOUNDS = {
  minLat: -33.7,
  maxLat: 5.2,
  minLng: -73.9,
  maxLng: -34.7,
}

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

    // Group assets with valid coordinates
    const mappedAssets = assets.filter(
      (a) =>
        typeof a.latitude === 'number' &&
        typeof a.longitude === 'number' &&
        a.latitude !== 0 &&
        a.longitude !== 0,
    )

    return { active, backlog, mappedAssets }
  }, [assets])

  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng - BRAZIL_BOUNDS.minLng) / (BRAZIL_BOUNDS.maxLng - BRAZIL_BOUNDS.minLng)) * 100
    const y = ((BRAZIL_BOUNDS.maxLat - lat) / (BRAZIL_BOUNDS.maxLat - BRAZIL_BOUNDS.minLat)) * 100
    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`,
    }
  }

  return (
    <Card className="h-full shadow-sm border-border/50 flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mapa Estratégico Georreferenciado
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

        {stats.mappedAssets.map((asset, idx) => (
          <div
            key={asset.id}
            className="absolute flex flex-col items-center animate-fade-in-up group"
            style={{
              ...getCoordinates(asset.latitude, asset.longitude),
              animationDelay: `${(idx % 10) * 0.1}s`,
            }}
          >
            <div className="relative flex h-8 w-8 items-center justify-center cursor-pointer">
              {asset.is_active && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30" />
              )}
              <div
                className={`h-3 w-3 rounded-full border-[2px] border-background shadow-md z-10 ${asset.is_active ? 'bg-primary' : 'bg-muted-foreground'}`}
              />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold bg-background/95 px-2 py-0.5 rounded shadow-md mt-1 backdrop-blur-sm border border-border whitespace-nowrap z-20 absolute top-full">
              {asset.asset_name || asset.fcu_code}
            </span>
          </div>
        ))}

        {stats.mappedAssets.length === 0 && assets.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground animate-fade-in">
            <Target className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Ativos sem coordenadas geográficas (Lat/Lng).</p>
          </div>
        )}

        {assets.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground animate-fade-in">
            <Target className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Aguardando telemetria de ativos...</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-md border p-3.5 rounded-lg shadow-sm z-10">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Status da Operação
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
              {stats.active} Operacionais
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground border border-background shadow-sm" />
              {stats.backlog} Em Backlog
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
