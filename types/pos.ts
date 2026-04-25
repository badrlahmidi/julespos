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

export type CourseType = 'starter' | 'main' | 'dessert' | 'drinks';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  category: Category | string;
  modifierGroups?: ModifierGroup[];
}

export type OrderItemStatus = 'pending' | 'preparing' | 'ready';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  selectedModifiers?: ModifierOption[];
  status?: OrderItemStatus;
  course?: CourseType;
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
