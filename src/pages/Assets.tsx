import { useState, useEffect } from 'react'
import { getAssets } from '@/services/assets'
import { useRealtime } from '@/hooks/use-realtime'
import { usePermissions } from '@/hooks/use-permissions'
import { AssetDetailSheet } from '@/components/assets/AssetDetailSheet'
import { AssetImportDialog } from '@/components/assets/AssetImportDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Upload, Loader2, Server } from 'lucide-react'

export default function Assets() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'asset_name',
    direction: 'asc',
  })
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const { isAdmin, isUser } = usePermissions()

  const loadAssets = async () => {
    if (!isUser) {
      setLoading(false)
      return
    }
    try {
      const data = await getAssets()
      setAssets(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  useRealtime(
    'assets',
    () => {
      loadAssets()
    },
    isUser,
  )

  const filteredAssets = assets
    .filter(
      (a) =>
        a.fcu_code?.toLowerCase().includes(search.toLowerCase()) ||
        a.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.city?.toLowerCase().includes(search.toLowerCase()) ||
        a.uf_code?.toLowerCase().includes(search.toLowerCase()),
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

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  if (!isUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-6 animate-fade-in-up">
        <Server className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para visualizar os ativos técnicos. Entre em contato com um
          administrador do sistema.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-8 w-8 text-primary" />
            Ativos Técnicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o inventário e as especificações de todos os sites e gabinetes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nome ou cidade..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('fcu_code')}
              >
                ID FCU{' '}
                {sortConfig.key === 'fcu_code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('asset_name')}
              >
                Nome do Ativo{' '}
                {sortConfig.key === 'asset_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('city')}
              >
                Localidade{' '}
                {sortConfig.key === 'city' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('asset_state')}
              >
                Status{' '}
                {sortConfig.key === 'asset_state' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhum ativo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedAsset(asset)
                    setIsDetailOpen(true)
                  }}
                >
                  <TableCell className="font-medium">{asset.fcu_code}</TableCell>
                  <TableCell>{asset.asset_name}</TableCell>
                  <TableCell>
                    {asset.city} {asset.uf_code ? `- ${asset.uf_code}` : ''}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        asset.asset_state === 'Operacional'
                          ? 'default'
                          : asset.asset_state === 'Desativado'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {asset.asset_state || 'N/D'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AssetDetailSheet
        asset={selectedAsset}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={() => {
          loadAssets()
        }}
      />

      <AssetImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => {
          setIsImportOpen(false)
        }}
      />
    </div>
  )
}
