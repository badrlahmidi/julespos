export interface Customer {
  id: string;
  phone: string;
  name: string;
  points: number;
  qrCode?: string;
  createdAt: number;
}
