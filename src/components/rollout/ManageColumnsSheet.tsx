import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { createRolloutStage, updateRolloutStage, deleteRolloutStage } from '@/services/assets'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ManageColumnsSheet({
  stages,
  onUpdated,
}: {
  stages: any[]
  onUpdated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [localStages, setLocalStages] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setLocalStages(JSON.parse(JSON.stringify(stages)))
    }
  }, [open, stages])

  const move = (index: number, direction: 'up' | 'down') => {
    const newStages = [...localStages]
    const activeIndices = newStages.map((s, i) => (s._isDeleted ? -1 : i)).filter((i) => i !== -1)
    const activePos = activeIndices.indexOf(index)

    if (direction === 'up' && activePos > 0) {
      const targetIndex = activeIndices[activePos - 1]
      const temp = newStages[index]
      newStages[index] = newStages[targetIndex]
      newStages[targetIndex] = temp
    } else if (direction === 'down' && activePos < activeIndices.length - 1) {
      const targetIndex = activeIndices[activePos + 1]
      const temp = newStages[index]
      newStages[index] = newStages[targetIndex]
      newStages[targetIndex] = temp
    }
    setLocalStages(newStages)
  }

  const handleAdd = () => {
    setLocalStages([...localStages, { _isNew: true, name: 'Nova Etapa', responsibility: 'AENZI' }])
  }

  const handleDelete = (index: number) => {
    const stage = localStages[index]
    if (!stage._isNew) {
      if (
        !confirm(
          'Tem certeza que deseja remover esta etapa? Ativos nesta etapa serão movidos para a primeira etapa disponível.',
        )
      ) {
        return
      }
      stage._isDeleted = true
      setLocalStages([...localStages])
    } else {
      setLocalStages(localStages.filter((_, i) => i !== index))
    }
  }

  const handleUpdate = (index: number, field: string, value: string) => {
    const newStages = [...localStages]
    newStages[index][field] = value
    newStages[index]._isDirty = true
    setLocalStages(newStages)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let order = 1
      for (const stage of localStages) {
        if (stage._isDeleted) {
          if (!stage._isNew) await deleteRolloutStage(stage.id)
          continue
        }

        const data = {
          name: stage.name,
          responsibility: stage.responsibility,
          order: order++,
        }

        if (stage._isNew) {
          await createRolloutStage(data)
        } else if (stage._isDirty || stage.order !== data.order) {
          await updateRolloutStage(stage.id, data)
        }
      }
      toast({ title: 'Colunas atualizadas com sucesso' })
      setOpen(false)
      onUpdated()
    } catch (error) {
      toast({ title: 'Erro ao salvar colunas', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Gerenciar Colunas
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md flex flex-col h-[100dvh]">
        <SheetHeader>
          <SheetTitle>Gerenciar Colunas</SheetTitle>
          <SheetDescription>
            Adicione, edite ou reordene as etapas do processo de rollout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 mt-6 min-h-0 relative">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-4">
              {localStages.map((stage, index) => {
                if (stage._isDeleted) return null

                const activeIndices = localStages
                  .map((s, i) => (s._isDeleted ? -1 : i))
                  .filter((i) => i !== -1)
                const isFirst = activeIndices[0] === index
                const isLast = activeIndices[activeIndices.length - 1] === index

                return (
                  <div
                    key={stage.id || index}
                    className="flex gap-3 items-start bg-secondary/20 p-3 rounded-lg border border-border/50"
                  >
                    <div className="flex flex-col gap-1 mt-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => move(index, 'up')}
                        disabled={isFirst}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => move(index, 'down')}
                        disabled={isLast}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 block">
                          Nome da Etapa
                        </Label>
                        <Input
                          value={stage.name}
                          onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 block">
                          Responsável
                        </Label>
                        <Input
                          value={stage.responsibility}
                          onChange={(e) => handleUpdate(index, 'responsibility', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 mt-5 shrink-0"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}

              <Button
                variant="outline"
                className="w-full gap-2 border-dashed h-12"
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4" />
                Adicionar Nova Etapa
              </Button>
            </div>
          </ScrollArea>
        </div>

        <div className="pt-4 pb-2 mt-auto border-t bg-background">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando Alterações...' : 'Salvar Alterações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
