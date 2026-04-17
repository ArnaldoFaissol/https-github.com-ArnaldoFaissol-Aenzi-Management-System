import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Target } from 'lucide-react'
import { getAssets } from '@/services/assets'
import { useRealtime } from '@/hooks/use-realtime'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet when bundled by Vite
// (we use CircleMarker below so this is only precautionary)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Centro aproximado do Brasil e zoom que mostra o pais inteiro
const BRAZIL_CENTER: [number, number] = [-14.2, -51.9]
const BRAZIL_ZOOM = 4

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

    const mappedAssets = assets.filter(
      (a) =>
        typeof a.latitude === 'number' &&
        typeof a.longitude === 'number' &&
        a.latitude !== 0 &&
        a.longitude !== 0,
    )

    return { active, backlog, mappedAssets }
  }, [assets])

  return (
    <Card className="h-full shadow-sm border-border/50 flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mapa Estratégico Georreferenciado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative min-h-[300px] overflow-hidden rounded-b-xl">
        <MapContainer
          center={BRAZIL_CENTER}
          zoom={BRAZIL_ZOOM}
          minZoom={3}
          maxZoom={18}
          scrollWheelZoom={false}
          className="h-full w-full absolute inset-0 z-0"
          style={{ background: 'hsl(var(--muted))' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stats.mappedAssets.map((asset) => {
            const isActive = Boolean(asset.is_active)
            return (
              <CircleMarker
                key={asset.id}
                center={[asset.latitude, asset.longitude]}
                radius={7}
                pathOptions={{
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  fillColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold text-sm mb-1">
                      {asset.asset_name || 'Ativo sem nome'}
                    </div>
                    {asset.fcu_code && (
                      <div className="font-mono text-muted-foreground">{asset.fcu_code}</div>
                    )}
                    {(asset.city || asset.uf_code) && (
                      <div className="mt-1">
                        {asset.city}
                        {asset.uf_code ? ` / ${asset.uf_code}` : ''}
                      </div>
                    )}
                    <div className="mt-1">
                      Status:{' '}
                      <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>
                        {isActive ? 'Operacional' : 'Backlog'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {stats.mappedAssets.length === 0 && assets.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/70 z-[400] pointer-events-none">
            <Target className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Ativos sem coordenadas geográficas (Lat/Lng).</p>
          </div>
        )}

        {assets.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/70 z-[400] pointer-events-none">
            <Target className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Aguardando telemetria de ativos...</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-md border p-3.5 rounded-lg shadow-sm z-[500]">
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
