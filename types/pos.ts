export type TableStatus = 'free' | 'occupied' | 'billing' | 'cleaning';

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  seats: number;
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

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  selectedModifiers?: Modifier[];
}

export type OrderStatus = 'open' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  tableId: string | null;
  items: OrderItem[];
  total: number;
  totalHT: number;
  totalTax: number;
  status: OrderStatus;
}
