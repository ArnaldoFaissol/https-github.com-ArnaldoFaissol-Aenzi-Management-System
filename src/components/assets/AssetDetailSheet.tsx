import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  Battery,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MapPin,
  Zap,
  Server,
  Network,
  Briefcase,
  Check,
  Loader2,
  Edit3,
  Save,
  X,
  Bluetooth,
  KeyRound,
  User,
  Map,
  FileText,
  Download,
  UploadCloud,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { updateAssetStep, updateAsset, deleteAsset, getRolloutStages } from '@/services/assets'
import {
  getAssetDocuments,
  uploadAssetDocument,
  deleteAssetDocument,
  getDocumentUrl,
} from '@/services/documents'
import { useRealtime } from '@/hooks/use-realtime'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'

interface Props {
  asset: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function AssetDetailSheet({ asset, open, onOpenChange, onUpdate }: Props) {
  const [localAsset, setLocalAsset] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadCategory, setUploadCategory] = useState('Other')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [activationSteps, setActivationSteps] = useState<any[]>([])

  const { toast } = useToast()
  const { isAdmin, canDeleteAsset } = usePermissions()

  useEffect(() => {
    setLocalAsset(asset)
    if (asset) setEditData(asset)
  }, [asset])

  useEffect(() => {
    if (open) {
      getRolloutStages().then((stages) => setActivationSteps(stages || []))
    }
  }, [open])

  useRealtime(
    'rollout_stages',
    () => {
      if (open) {
        getRolloutStages().then((stages) => setActivationSteps(stages || []))
      }
    },
    open,
  )

  const loadDocuments = async () => {
    if (!asset?.id) return
    try {
      const docs = await getAssetDocuments(asset.id)
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  useEffect(() => {
    if (open && asset?.id) {
      loadDocuments()
    }
  }, [asset?.id, open])

  useRealtime(
    'asset_documents',
    () => {
      if (open) loadDocuments()
    },
    open,
  )

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({ title: 'Selecione um arquivo', variant: 'destructive' })
      return
    }
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('asset_id', localAsset.id)
      formData.append('file', uploadFile)
      formData.append('name', uploadName || uploadFile.name)
      formData.append('category', uploadCategory)

      await uploadAssetDocument(formData)
      setUploadFile(null)
      setUploadName('')
      setUploadCategory('Other')
      toast({ title: 'Documento enviado com sucesso!' })
    } catch (e: any) {
      toast({ title: 'Erro ao enviar documento', description: e.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    try {
      await deleteAssetDocument(id)
      toast({ title: 'Documento excluído com sucesso!' })
    } catch (e: any) {
      toast({ title: 'Erro ao excluir documento', description: e.message, variant: 'destructive' })
    }
  }

  if (!localAsset) return null

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return
    setIsDeleting(true)
    try {
      await deleteAsset(localAsset.id)
      onOpenChange(false)
      if (onUpdate) onUpdate()
      toast({ title: 'Ativo excluído com sucesso!' })
    } catch (e: any) {
      toast({
        title: 'Erro ao excluir',
        description: e.message || 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setErrors({})
    try {
      const updated = await updateAsset(localAsset.id, editData)
      setLocalAsset(updated)
      setIsEditing(false)
      if (onUpdate) onUpdate()
      toast({ title: 'Ativo atualizado com sucesso!' })
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar',
        description: e.message || 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderRow = (
    label: string,
    field: string,
    type: 'text' | 'number' | 'date' | 'select' | 'boolean' = 'text',
    icon?: React.ReactNode,
    options?: { value: string; label: string }[],
  ) => {
    if (isEditing) {
      return (
        <li className="flex flex-col py-2 border-b gap-1">
          <Label className="text-muted-foreground text-xs">{label}</Label>
          {type === 'boolean' ? (
            <div className="flex items-center h-8">
              <Switch
                checked={!!editData[field]}
                onCheckedChange={(val) => setEditData((prev: any) => ({ ...prev, [field]: val }))}
              />
            </div>
          ) : type === 'date' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal h-8 text-sm',
                    !editData[field] && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editData[field] ? (
                    format(new Date(editData[field]), 'PPP')
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editData[field] ? new Date(editData[field]) : undefined}
                  onSelect={(date) =>
                    setEditData((prev: any) => ({
                      ...prev,
                      [field]: date ? date.toISOString() : null,
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : type === 'select' && options ? (
            <Select
              value={editData[field] || ''}
              onValueChange={(val) => setEditData((prev: any) => ({ ...prev, [field]: val }))}
            >
              <SelectTrigger className="h-8 text-sm w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={type}
              value={
                editData[field] === null || editData[field] === undefined ? '' : editData[field]
              }
              onChange={(e) => {
                const val = e.target.value
                setEditData((prev: any) => ({
                  ...prev,
                  [field]: type === 'number' ? (val === '' ? null : Number(val)) : val,
                }))
              }}
              className="h-8 text-sm w-full"
            />
          )}
          {errors[field] && <span className="text-[10px] text-destructive">{errors[field]}</span>}
        </li>
      )
    }

    let displayVal = localAsset[field]
    if (type === 'boolean') {
      displayVal = displayVal ? 'Sim' : 'Não'
    } else if (type === 'date' && displayVal) {
      const d = new Date(displayVal)
      displayVal = isNaN(d.getTime()) ? 'N/D' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    } else if (displayVal === null || displayVal === undefined || displayVal === '') {
      displayVal = 'N/D'
    }

    return (
      <li className="flex justify-between items-center text-sm py-2 border-b">
        <span className="text-muted-foreground flex items-center gap-1.5 min-w-[120px]">
          {icon} {label}
        </span>
        <span className="font-medium text-right break-words max-w-[60%]">{String(displayVal)}</span>
      </li>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto pb-10">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mt-4">
            {isEditing ? (
              <div className="w-2/3 space-y-1">
                <Input
                  value={editData.asset_name || ''}
                  onChange={(e) => setEditData({ ...editData, asset_name: e.target.value })}
                  className="font-bold text-lg h-9"
                  placeholder="Nome do Ativo"
                />
                {errors.asset_name && (
                  <span className="text-[10px] text-destructive">{errors.asset_name}</span>
                )}
              </div>
            ) : (
              <SheetTitle className="text-xl">{localAsset.asset_name}</SheetTitle>
            )}

            <div className="flex items-center gap-2">
              {canDeleteAsset && !isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              {isAdmin &&
                (isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsEditing(false)
                        setErrors({})
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditData(localAsset)
                      setIsEditing(true)
                    }}
                  >
                    <Edit3 className="mr-2 h-3 w-3" /> Editar
                  </Button>
                ))}
            </div>
          </div>
          <div className="mt-1">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">ID FCU</Label>
                  <Input
                    value={editData.fcu_code || ''}
                    onChange={(e) => setEditData({ ...editData, fcu_code: e.target.value })}
                    className="h-8 text-sm max-w-[200px]"
                  />
                  {errors.fcu_code && (
                    <span className="text-[10px] text-destructive">{errors.fcu_code}</span>
                  )}
                </div>
              </div>
            ) : (
              <SheetDescription className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {localAsset.city || 'Cidade N/D'}{' '}
                {localAsset.uf_code ? `(${localAsset.uf_code})` : ''} | ID: {localAsset.fcu_code}
              </SheetDescription>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="text-xs sm:text-sm">
              Geral
            </TabsTrigger>
            <TabsTrigger value="technical" className="text-xs sm:text-sm">
              Técnico
            </TabsTrigger>
            <TabsTrigger value="process" className="text-xs sm:text-sm">
              Proc.
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs sm:text-sm">
              Local.
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4 text-primary" /> Telemetria & Operação
              </h4>
              <ul className="space-y-1 mb-4">
                {renderRow('Status do Ativo', 'asset_state', 'select', undefined, [
                  { value: 'Operacional', label: 'Operacional' },
                  { value: 'Em Implantação', label: 'Em Implantação' },
                  { value: 'Em Manutenção', label: 'Em Manutenção' },
                  { value: 'Desativado', label: 'Desativado' },
                ])}
                {renderRow('Ativo em Operação', 'is_active', 'boolean')}
                {renderRow('Em Estoque', 'is_in_stock', 'boolean')}
                {renderRow(
                  'Receita Mensal (R$)',
                  'monthly_revenue',
                  'number',
                  <DollarSign className="h-3.5 w-3.5" />,
                )}
                {renderRow(
                  'Valor do Contrato (R$)',
                  'contract_value',
                  'number',
                  <DollarSign className="h-3.5 w-3.5" />,
                )}
              </ul>

              <div className="bg-muted p-4 rounded-lg border space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Battery className="h-4 w-4" /> Nível da Bateria
                  </span>
                  <span className="font-medium">{localAsset.battery_level || 0}%</span>
                </div>
                <Progress
                  value={localAsset.battery_level || 0}
                  className="h-2"
                  indicatorClassName={
                    (localAsset.battery_level || 0) > 20 ? 'bg-primary' : 'bg-destructive'
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-4 w-4 text-primary" /> Histórico Técnico
              </h4>
              <ul className="space-y-1">
                {renderRow('Data de Instalação', 'installation_date', 'date')}
                {renderRow('Uptime Geral (%)', 'uptime', 'number')}
                {renderRow(
                  'MTTR Recente (h)',
                  'mttr_hours',
                  'number',
                  <Clock className="h-3.5 w-3.5" />,
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-4 space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Server className="h-4 w-4 text-primary" /> Especificações do Equipamento
            </h4>
            <ul className="space-y-1">
              {renderRow('Tipo de Gabinete', 'cabinet_type')}
              {renderRow('SN Bastidor', 'rack_serial_number')}
              {renderRow(
                'Tipo de Rede',
                'network_type',
                'text',
                <Network className="h-3.5 w-3.5" />,
              )}
              {renderRow('Utilidade (Utility)', 'utility')}
              {renderRow('Qtd. Baterias', 'battery_qty', 'number')}
              {renderRow('Número de Retificadores', 'rectifier_number', 'number')}
              {renderRow('Espec. Retificadores', 'rectifier_spec')}
              {renderRow('Ar Condicionado', 'air_conditioning', 'boolean')}
              {renderRow(
                'Bluetooth',
                'bluetooth',
                'boolean',
                <Bluetooth className="h-3.5 w-3.5" />,
              )}
              {renderRow('Blindado', 'armored')}
            </ul>
          </TabsContent>

          <TabsContent value="process" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground mb-4">
                <Briefcase className="h-4 w-4 text-primary" /> Workflow de Ativação
              </h4>
              <div className="mb-4">
                <ul className="space-y-1">{renderRow('Pendências', 'pendency', 'number')}</ul>
              </div>
              <div className="relative border-l border-border/60 ml-3 pl-6 space-y-6">
                {activationSteps.map((step, index) => {
                  const currentStepId = localAsset.step_number || '0'
                  const activeIndex = Math.max(
                    0,
                    activationSteps.findIndex((s) => s.id === currentStepId),
                  )
                  const isCompleted = index < activeIndex
                  const isCurrent = index === activeIndex

                  return (
                    <div key={step.id} className="relative">
                      <div
                        className={`absolute -left-[34px] top-0 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-background
                        ${isCompleted ? 'border-primary text-primary bg-primary/10' : isCurrent ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'}`}
                      >
                        {isCompleted && <Check className="h-3 w-3" />}
                        {isCurrent && <div className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      <div className="-mt-0.5">
                        <h5
                          className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {step.name}
                        </h5>
                        {isCurrent && index < activationSteps.length - 1 && (
                          <Button
                            size="sm"
                            className="mt-3 h-8 text-xs"
                            onClick={() => {
                              setIsUpdating(true)
                              updateAssetStep(
                                localAsset.id,
                                activationSteps[index + 1].id,
                                activationSteps[index + 1].name,
                              )
                                .then(() => {
                                  setIsUpdating(false)
                                  if (onUpdate) onUpdate()
                                })
                                .catch(() => setIsUpdating(false))
                            }}
                            disabled={isUpdating}
                          >
                            Avançar Etapa
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {activationSteps.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                    Nenhuma etapa configurada.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Endereço e Coordenadas
              </h4>
              <ul className="space-y-1">
                {renderRow('Endereço', 'address')}
                {renderRow('Cidade', 'city')}
                {renderRow('UF', 'uf_code')}
                {renderRow('Latitude', 'latitude', 'number')}
                {renderRow('Longitude', 'longitude', 'number')}
              </ul>
            </div>
            <Separator />
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Map className="h-4 w-4 text-primary" /> Dados Regionais e Chaves
              </h4>
              <ul className="space-y-1">
                {renderRow('IAMS Regional', 'iams_regional')}
                {renderRow('Rack Key', 'rack_key', 'text', <KeyRound className="h-3.5 w-3.5" />)}
                {renderRow('Holder', 'holder', 'text', <User className="h-3.5 w-3.5" />)}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <FileText className="h-4 w-4 text-primary" /> Documentos do Ativo
              </h4>

              {isAdmin && (
                <div className="bg-muted p-3 rounded-lg border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Nome do Documento (Opcional)"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      className="h-8 text-sm bg-background"
                    />
                    <Select value={uploadCategory} onValueChange={setUploadCategory}>
                      <SelectTrigger className="h-8 text-sm bg-background">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contract">Contrato</SelectItem>
                        <SelectItem value="Audit Report">Relatório de Auditoria</SelectItem>
                        <SelectItem value="Other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="h-8 text-sm flex-1 cursor-pointer bg-background"
                    />
                    <Button
                      size="sm"
                      className="h-8 shrink-0"
                      onClick={handleUpload}
                      disabled={isUploading || !uploadFile}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4 mr-2" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              )}

              <ul className="space-y-2 mt-4">
                {documents.length === 0 ? (
                  <li className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                    Nenhum documento encontrado para este ativo.
                  </li>
                ) : (
                  documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 rounded-md shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-medium text-sm truncate"
                            title={doc.name || doc.file}
                          >
                            {doc.name || doc.file}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium h-4 px-1.5"
                            >
                              {doc.category === 'Contract'
                                ? 'Contrato'
                                : doc.category === 'Audit Report'
                                  ? 'Auditoria'
                                  : 'Outro'}
                            </Badge>
                            <span>{format(new Date(doc.created), 'dd/MM/yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={getDocumentUrl(doc)} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDoc(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
