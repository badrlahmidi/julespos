export type Role = 'SERVER' | 'MANAGER' | 'ADMIN' | 'KITCHEN';

export interface User {
  id: string;
  name: string;
  role: Role;
  pinHash: string; // In a real app, this should be securely hashed. For the prototype, we'll use a simple representation.
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VOID_ORDER'
  | 'VOID_ITEM'
  | 'DISCOUNT_APPLIED'
  | 'ORDER_PAID'
  | 'ORDER_SENT_TO_KITCHEN'
  | 'TABLE_OPENED';

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: AuditAction;
  details?: string;
  orderId?: string;
}
