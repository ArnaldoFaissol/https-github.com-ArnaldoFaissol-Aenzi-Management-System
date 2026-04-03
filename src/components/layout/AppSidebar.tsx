import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Truck,
  DollarSign,
  ShieldCheck,
  Settings,
  Zap,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'

const menuItems = [
  { title: 'Resumo Executivo', path: '/', icon: LayoutDashboard },
  { title: 'Ativos & Telemetria', path: '/ativos', icon: Server },
  { title: 'Cronograma (Rollout)', path: '/rollout', icon: Truck },
  { title: 'Faturamento & ROI', path: '/financeiro', icon: DollarSign },
  { title: 'Governança', path: '#', icon: ShieldCheck },
  { title: 'Configurações', path: '#', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" className="border-r-0 shadow-lg">
      <SidebarHeader className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-md">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-sidebar-foreground">
              AENZI
            </span>
            <span className="text-xs text-primary font-medium">Ops Central</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 mt-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-[10px]">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-11 transition-all duration-200 hover:bg-sidebar-accent/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="rounded-xl bg-sidebar-accent p-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-sidebar-foreground/70">Uptime Global</span>
            <span className="text-xs font-bold text-primary">98.5%</span>
          </div>
          <div className="h-1.5 w-full bg-sidebar-background rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[98.5%] rounded-full" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-medium text-sidebar-foreground/70">Sites Ativos</span>
            <span className="text-xs font-bold">
              16 <span className="text-sidebar-foreground/40 font-normal">/ 4000</span>
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
