export interface ClientGrowthPoint {
  key: string;
  label: string;
  total: number;
}

export interface TopClientMetric {
  id: string;
  name: string | null;
  email: string | null;
  ordersCount: number;
  lastOrderAt: string | null;
}

export interface ClientExportRow {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  ordersCount: number;
}

export interface AdminClientsAnalytics {
  totalClients: number;
  activeClientsLast30Days: number;
  inactiveClientsLast30Days: number;
  requestedQuoteClients: number;
  neverInteractedClients: number;
  weeklyGrowth: ClientGrowthPoint[];
  monthlyGrowth: ClientGrowthPoint[];
  topClients: TopClientMetric[];
  exportRows: ClientExportRow[];
}

