import { useState } from 'react'
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
import { MOCK_ASSETS, Asset } from '@/lib/mock-data'
import { AssetDetailSheet } from './AssetDetailSheet'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'

export function AssetTable() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAssets = MOCK_ASSETS.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[120px]">ID Gabinete</TableHead>
              <TableHead>Nome do Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Região</TableHead>
              <TableHead className="text-right">Receita/Mês</TableHead>
              <TableHead className="text-right">Uptime</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow
                key={asset.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedAsset(asset)}
              >
                <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      asset.status === 'Operational'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : asset.status === 'Maintenance'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-muted text-muted-foreground border-border'
                    }
                  >
                    {asset.status === 'Operational'
                      ? 'Operacional'
                      : asset.status === 'Maintenance'
                        ? 'Manutenção'
                        : 'Backlog'}
                  </Badge>
                </TableCell>
                <TableCell>{asset.region}</TableCell>
                <TableCell className="text-right font-mono">
                  {asset.revenue > 0 ? `R$ ${asset.revenue.toLocaleString('pt-BR')}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {asset.uptime > 0 ? (
                    <span className={asset.uptime < 99 ? 'text-destructive font-medium' : ''}>
                      {asset.uptime}%
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-primary hover:bg-primary/10"
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AssetDetailSheet
        asset={selectedAsset}
        open={!!selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
      />
    </div>
  )
}
