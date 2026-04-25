export type PrinterType = 'usb' | 'bluetooth' | 'network';

export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  address?: string; // IP Address for network printers
  vid?: number;     // Vendor ID for USB
  pid?: number;     // Product ID for USB
}

export interface ReceiptData {
  restaurantName: string;
  address: string;
  siret: string;
  orderId: string;
  date: Date;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  qrCodeData?: string;
}
