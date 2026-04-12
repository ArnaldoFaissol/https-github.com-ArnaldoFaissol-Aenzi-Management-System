import { useState, useEffect } from 'react'
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
import { AssetDetailSheet } from './AssetDetailSheet'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { getAssets } from '@/services/assets'
import { useRealtime } from '@/hooks/use-realtime'

export function AssetTable() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'asset_name',
    direction: 'asc',
  })

  const loadData = () => {
    getAssets().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('assets', () => {
    loadData()
  })

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const filteredAssets = assets
    .filter(
      (a) =>
        a.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.fcu_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.uf_code?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
              <TableHead
                className="w-[120px] cursor-pointer hover:bg-muted"
                onClick={() => handleSort('fcu_code')}
              >
                ID Gabinete{' '}
                {sortConfig.key === 'fcu_code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('asset_name')}
              >
                Nome do Site{' '}
                {sortConfig.key === 'asset_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('asset_state')}
              >
                Status{' '}
                {sortConfig.key === 'asset_state' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('process_status')}
              >
                Etapa / Processo{' '}
                {sortConfig.key === 'process_status' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('city')}
              >
                Localidade{' '}
                {sortConfig.key === 'city' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted"
                onClick={() => handleSort('contract_value')}
              >
                Receita/Mês{' '}
                {sortConfig.key === 'contract_value' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted"
                onClick={() => handleSort('uptime')}
              >
                Uptime {sortConfig.key === 'uptime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
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
                <TableCell className="font-mono text-xs">{asset.fcu_code}</TableCell>
                <TableCell className="font-medium">{asset.asset_name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      asset.asset_state === 'Operacional' || asset.asset_state === 'Ativo'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : asset.asset_state === 'Manutenção'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : asset.asset_state === 'Em Estoque'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                    }
                  >
                    {asset.asset_state || 'N/D'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{asset.step_number || '-'}</span>
                    <span className="text-xs text-muted-foreground">
                      {asset.process_status || '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{asset.city || '-'}</span>
                    <span className="text-xs text-muted-foreground">{asset.uf_code || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {asset.contract_value > 0
                    ? `R$ ${asset.contract_value.toLocaleString('pt-BR')}`
                    : '-'}
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
