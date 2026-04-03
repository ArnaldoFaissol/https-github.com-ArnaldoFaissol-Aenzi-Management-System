export type CabinetStatus = 'Operational' | 'Maintenance' | 'Backlog'

export interface Asset {
  id: string
  name: string
  status: CabinetStatus
  region: string
  revenue: number
  uptime: number
  installDate: string
  batteryLevel: number
  kwh: number
  mttr: string
  lat: number
  lng: number
}

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'CAB-001',
    name: 'Site Alpha SP',
    status: 'Operational',
    region: 'SP',
    revenue: 4000,
    uptime: 99.9,
    installDate: '2025-01-10',
    batteryLevel: 85,
    kwh: 1250,
    mttr: '1.2h',
    lat: -23.5505,
    lng: -46.6333,
  },
  {
    id: 'CAB-002',
    name: 'Site Beta SP',
    status: 'Operational',
    region: 'SP',
    revenue: 3800,
    uptime: 99.5,
    installDate: '2025-01-15',
    batteryLevel: 92,
    kwh: 1100,
    mttr: '0.8h',
    lat: -23.5605,
    lng: -46.6433,
  },
  {
    id: 'CAB-003',
    name: 'Site Gamma MG',
    status: 'Maintenance',
    region: 'MG',
    revenue: 2500,
    uptime: 95.0,
    installDate: '2025-02-01',
    batteryLevel: 45,
    kwh: 800,
    mttr: '4.5h',
    lat: -19.9208,
    lng: -43.9378,
  },
  {
    id: 'CAB-004',
    name: 'Site Delta MG',
    status: 'Operational',
    region: 'MG',
    revenue: 3900,
    uptime: 99.8,
    installDate: '2025-02-10',
    batteryLevel: 100,
    kwh: 1300,
    mttr: '1.0h',
    lat: -19.9308,
    lng: -43.9478,
  },
  {
    id: 'CAB-005',
    name: 'Site Epsilon SP',
    status: 'Operational',
    region: 'SP',
    revenue: 4100,
    uptime: 100,
    installDate: '2025-02-15',
    batteryLevel: 98,
    kwh: 1400,
    mttr: '0h',
    lat: -23.5405,
    lng: -46.6233,
  },
  {
    id: 'CAB-006',
    name: 'Site Zeta SP',
    status: 'Backlog',
    region: 'SP',
    revenue: 0,
    uptime: 0,
    installDate: 'Pending',
    batteryLevel: 0,
    kwh: 0,
    mttr: 'N/A',
    lat: -23.5705,
    lng: -46.6533,
  },
  {
    id: 'CAB-007',
    name: 'Site Eta MG',
    status: 'Backlog',
    region: 'MG',
    revenue: 0,
    uptime: 0,
    installDate: 'Pending',
    batteryLevel: 0,
    kwh: 0,
    mttr: 'N/A',
    lat: -19.9408,
    lng: -43.9578,
  },
  {
    id: 'CAB-008',
    name: 'Site Theta SP',
    status: 'Operational',
    region: 'SP',
    revenue: 3600,
    uptime: 99.1,
    installDate: '2025-03-01',
    batteryLevel: 78,
    kwh: 1050,
    mttr: '2.1h',
    lat: -23.5805,
    lng: -46.6633,
  },
  {
    id: 'CAB-009',
    name: 'Site Iota MG',
    status: 'Backlog',
    region: 'MG',
    revenue: 0,
    uptime: 0,
    installDate: 'Pending',
    batteryLevel: 0,
    kwh: 0,
    mttr: 'N/A',
    lat: -19.9508,
    lng: -43.9678,
  },
  {
    id: 'CAB-010',
    name: 'Site Kappa SP',
    status: 'Backlog',
    region: 'SP',
    revenue: 0,
    uptime: 0,
    installDate: 'Pending',
    batteryLevel: 0,
    kwh: 0,
    mttr: 'N/A',
    lat: -23.5905,
    lng: -46.6733,
  },
]

export const REVENUE_DATA = [
  { month: 'Jan', SP: 12000, MG: 8000 },
  { month: 'Fev', SP: 18000, MG: 10000 },
  { month: 'Mar', SP: 25000, MG: 15000 },
  { month: 'Abr', SP: 32000, MG: 22000 },
  { month: 'Mai', SP: 45000, MG: 28000 },
  { month: 'Jun', SP: 55000, MG: 37000 }, // Projected R$ 92k total
]

export const KPI_BASELINE = [
  { metric: 'Perda Operacional', current: '18%', target: '-25%', status: 'warning' },
  { metric: 'Retenção de Clientes', current: '82%', target: '+40%', status: 'success' },
  { metric: 'MTTR (Tempo Médio de Reparo)', current: '4.5h', target: '< 2h', status: 'danger' },
  { metric: 'Custo de Logística / Site', current: 'R$ 850', target: '-15%', status: 'warning' },
]

export const BACKLOG_SITES = MOCK_ASSETS.filter((a) => a.status === 'Backlog')
export const ACTIVE_SITES = MOCK_ASSETS.filter((a) => a.status !== 'Backlog')
