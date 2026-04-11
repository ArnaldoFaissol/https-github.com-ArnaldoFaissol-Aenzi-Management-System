import { useState } from 'react'
import { AssetTable } from '@/components/assets/AssetTable'
import { AssetImportDialog } from '@/components/assets/AssetImportDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload } from 'lucide-react'

export default function Assets() {
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Ativos & Telemetria
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Skip Cloud Sync
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Gestão detalhada dos gabinetes operacionais e monitoramento IoT em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button className="gap-2 shrink-0 shadow-sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Importar CSV
          </Button>
        </div>
      </div>

      <AssetTable />

      <AssetImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
