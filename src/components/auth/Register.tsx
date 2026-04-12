import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Zap, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem. Tente novamente.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    const { error } = await signUp({ name, email, password, passwordConfirm })
    setIsSubmitting(false)

    if (error) {
      toast({
        title: 'Erro no Cadastro',
        description: error.message || 'Ocorreu um erro ao criar a conta.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso.',
      })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 animate-fade-in">
      <Card className="w-full max-w-sm shadow-elevation border-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se na Plataforma Skip</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirmar Senha"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
