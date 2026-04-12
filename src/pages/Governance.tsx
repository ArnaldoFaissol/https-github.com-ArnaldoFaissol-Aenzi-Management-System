import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Scale, Leaf, FileText, Users, AlertTriangle } from 'lucide-react'

export default function Governance() {
  return (
    <div className="flex flex-col gap-6 animate-slide-up p-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-1 text-foreground">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Governança Corporativa e ESG
        </h1>
        <p className="text-muted-foreground">
          Portal Institucional de Relações com Investidores, Compliance e Sustentabilidade (Padrão
          Motiva).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Governança Corporativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Estrutura de conselho, comitês de auditoria, políticas de administração e portal de
              transparência focado em acionistas.
            </p>
            <ul className="space-y-3 text-sm mt-4">
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Diretrizes de Infraestrutura Motiva
                </span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">Estatuto Social v2.1</span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Composição do Conselho
                </span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Relatórios de RI Trimestrais
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-primary" />
              Compliance e Ética
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Políticas de conformidade rigorosas, gestão de riscos, manuais de conduta e canais de
              comunicação seguros.
            </p>
            <ul className="space-y-3 text-sm mt-4">
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Código de Conduta Ética
                </span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Política Anticorrupção
                </span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 cursor-pointer transition-colors border border-amber-500/20">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Canal de Denúncias Confidencial</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="h-5 w-5 text-green-500" />
              ESG (Ambiental e Social)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Acompanhamento de métricas de impacto ambiental, matriz energética renovável e
              engajamento com a comunidade.
            </p>
            <ul className="space-y-3 text-sm mt-4">
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Relatório de Sustentabilidade 2025
                </span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Auditoria de Pegada de Carbono
                </span>
              </li>
              <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-secondary-foreground">
                  Projetos de Impacto Social
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
