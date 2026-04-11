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
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const { isAdmin } = usePermissions()

  const loadAssets = async () => {
    if (!isAdmin) {
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
  }, [isAdmin])

  useRealtime(
    'assets',
    () => {
      loadAssets()
    },
    isAdmin,
  )

  const filteredAssets = assets.filter(
    (a) =>
      a.fcu_code?.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.city?.toLowerCase().includes(search.toLowerCase()),
  )

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-6 animate-fade-in-up">
        <Server className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para visualizar ou gerenciar os ativos técnicos. Entre em contato
          com um administrador do sistema.
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
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
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
              <TableHead>ID FCU</TableHead>
              <TableHead>Nome do Ativo</TableHead>
              <TableHead>Localidade</TableHead>
              <TableHead>Status</TableHead>
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
