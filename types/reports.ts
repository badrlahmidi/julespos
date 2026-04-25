export interface ZReport {
  id: string;
  date: number;
  openedAt: number;
  closedAt: number;
  totalSales: number;
  totalTax: number;
  totalCash: number;
  totalCard: number;
  totalOther: number;
  ordersCount: number;
  closedBy: string; // User ID
}

export interface RevenueByHour {
  hour: string;
  revenue: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}
