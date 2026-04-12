import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Login from '@/components/auth/Login'
import Register from '@/components/auth/Register'

import Layout from './components/Layout'
import Index from './pages/Index'
import Assets from './pages/Assets'
import Rollout from './pages/Rollout'
import Billing from './pages/Billing'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'superuser']} />}>
                <Route path="/ativos" element={<Assets />} />
              </Route>
              <Route path="/rollout" element={<Rollout />} />
              <Route path="/financeiro" element={<Billing />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
