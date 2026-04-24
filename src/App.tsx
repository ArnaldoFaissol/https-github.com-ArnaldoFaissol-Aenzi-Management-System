import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Login from '@/components/auth/Login'
import Register from '@/components/auth/Register'

import Layout from './components/Layout'

// Route-level code splitting: heavy pages (charts, map, kanban) only load when visited
const Index = lazy(() => import('./pages/Index'))
const Assets = lazy(() => import('./pages/Assets'))
const Rollout = lazy(() => import('./pages/Rollout'))
const Billing = lazy(() => import('./pages/Billing'))
const Governance = lazy(() => import('./pages/Governance'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

const PageLoader = () => (
  <div className="flex h-[calc(100vh-80px)] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'superuser']} />}>
                  <Route path="/ativos" element={<Assets />} />
                </Route>
                <Route path="/rollout" element={<Rollout />} />
                <Route path="/financeiro" element={<Billing />} />
                <Route path="/governanca" element={<Governance />} />
                <Route element={<ProtectedRoute allowedRoles={['admin', 'superuser']} />}>
                  <Route path="/configuracoes" element={<Settings />} />
                </Route>
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
