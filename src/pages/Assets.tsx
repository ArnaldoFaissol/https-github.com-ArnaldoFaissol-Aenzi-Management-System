import { AssetTable } from '@/components/assets/AssetTable'

export default function Assets() {
  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
            Ativos & Telemetria
          </h1>
          <p className="text-muted-foreground">
            Gestão detalhada dos gabinetes operacionais e monitoramento IoT em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total em Operação
            </span>
            <span className="text-xl font-bold text-primary">
              16 <span className="text-sm font-normal text-muted-foreground">/ 4000 metas</span>
            </span>
          </div>
        </div>
      </div>

      <AssetTable />
    </div>
  )
}
