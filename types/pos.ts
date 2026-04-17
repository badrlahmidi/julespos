export type TableStatus = 'available' | 'occupied' | 'ordered' | 'billing';

export interface Table {
  id: string;
  label: string;
  status: TableStatus;
  capacity: number;
  orderId?: string;
  lastActionTime?: number; // timestamp
}

export interface Category {
  id: string;
  name: string;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  category: Category | string;
  modifiers?: Modifier[];
}

export type OrderItemStatus = 'pending' | 'preparing' | 'ready';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  selectedModifiers?: Modifier[];
  status?: OrderItemStatus;
}

export type OrderStatus = 'open' | 'sent-to-kitchen' | 'preparing' | 'ready' | 'history' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  tableId: string | null;
  items: OrderItem[];
  total: number;
  totalHT: number;
  totalTax: number;
  status: OrderStatus;
  sentAt?: number;
  isUrgent?: boolean;
}
