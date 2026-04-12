import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Settings2, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(user?.name || '')

  const loadUsers = async () => {
    try {
      const records = await pb.collection('users').getFullList({ sort: '-created' })
      setUsersList(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superuser') {
      loadUsers()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      await pb.collection('users').update(user.id, { name })
      toast({ title: 'Perfil atualizado com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-slide-up p-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 mb-1">
          <Settings2 className="h-8 w-8 text-primary" />
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground">
          Gerenciamento de parâmetros operacionais, dados da conta e controle de acesso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-border/50 h-fit">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Institucional</Label>
              <Input value={user?.email || ''} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Nível de Acesso (Função)</Label>
              <Input
                value={user?.role || ''}
                disabled
                className="uppercase bg-muted/50 font-medium"
              />
            </div>
            <Button onClick={handleUpdateProfile} className="w-full sm:w-auto mt-2">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {(user?.role === 'admin' || user?.role === 'superuser') && (
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription>Lista de credenciais com acesso à plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Função</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium text-sm">
                            {u.name || 'Usuário Sem Nome'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                u.role === 'superuser'
                                  ? 'default'
                                  : u.role === 'admin'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="uppercase text-[10px]"
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
