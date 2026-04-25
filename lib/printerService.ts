import type { Printer, ReceiptData } from '../types/printer';

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;

export const PrinterCommands = {
  INIT: new Uint8Array([ESC, 0x40]),
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  TEXT_NORMAL: new Uint8Array([ESC, 0x21, 0x00]),
  TEXT_BOLD: new Uint8Array([ESC, 0x45, 0x01]),
  TEXT_BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  TEXT_DOUBLE_HEIGHT: new Uint8Array([ESC, 0x21, 0x10]),
  TEXT_DOUBLE_WIDTH: new Uint8Array([ESC, 0x21, 0x20]),
  TEXT_DOUBLE_HW: new Uint8Array([ESC, 0x21, 0x30]),
  NEWLINE: new Uint8Array([0x0A]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x00]),
  // Standard pulse command to open drawer (pin 2)
  OPEN_DRAWER: new Uint8Array([ESC, 0x70, 0x00, 0x19, 0xFA])
};

class EscPosEncoder {
  private buffer: number[] = [];

  add(command: Uint8Array) {
    this.buffer.push(...Array.from(command));
    return this;
  }

  text(str: string) {
    const encoder = new TextEncoder(); // UTF-8 by default, actual ESC/POS needs specific codepages, but UTF-8 works for basic ASCII/latin
    // For a real production app in France, we might need a specific codepage mapping for accents (e.g., CP858).
    // Here we use simple ascii mapping for prototype safety.
    const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    this.buffer.push(...Array.from(encoder.encode(normalized)));
    return this;
  }

  newline() {
    this.add(PrinterCommands.NEWLINE);
    return this;
  }

  line(str: string) {
    this.text(str).newline();
    return this;
  }

  encode(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export const generateReceiptPayload = (data: ReceiptData): Uint8Array => {
  const encoder = new EscPosEncoder();

  encoder.add(PrinterCommands.INIT)
         .add(PrinterCommands.ALIGN_CENTER)
         .add(PrinterCommands.TEXT_DOUBLE_HW)
         .line(data.restaurantName)
         .add(PrinterCommands.TEXT_NORMAL)
         .line(data.address)
         .line(`SIRET: ${data.siret}`)
         .newline()
         .add(PrinterCommands.ALIGN_LEFT)
         .line(`Date: ${data.date.toLocaleString('fr-FR')}`)
         .line(`Ticket #${data.orderId}`)
         .line('-'.repeat(32));

  // Items
  data.items.forEach(item => {
     // Very simplified alignment for 32 chars width (standard 58mm printer)
     const line1 = `${item.quantity}x ${item.name}`;
     const line2 = `${item.total.toFixed(2)} EUR`.padStart(32, ' ');
     encoder.line(line1);
     encoder.line(line2);
  });

  encoder.line('-'.repeat(32))
         .add(PrinterCommands.ALIGN_RIGHT)
         .line(`Sous-total: ${data.subtotal.toFixed(2)} EUR`)
         .line(`TVA: ${data.tax.toFixed(2)} EUR`)
         .add(PrinterCommands.TEXT_DOUBLE_HEIGHT)
         .line(`TOTAL: ${data.total.toFixed(2)} EUR`)
         .add(PrinterCommands.TEXT_NORMAL)
         .newline();

  if (data.paymentMethod) {
      encoder.add(PrinterCommands.ALIGN_CENTER)
             .line(`Paiement: ${data.paymentMethod}`);
  }

  encoder.newline()
         .add(PrinterCommands.ALIGN_CENTER)
         .line('Merci de votre visite !')
         .newline()
         .newline()
         .add(PrinterCommands.CUT_PAPER);

  return encoder.encode();
};

export const generateOpenDrawerPayload = (): Uint8Array => {
  return new EscPosEncoder()
    .add(PrinterCommands.INIT)
    .add(PrinterCommands.OPEN_DRAWER)
    .encode();
};

// --- Connection Handlers ---

export const printViaWebUSB = async (printer: Printer, payload: Uint8Array) => {
  if (!('usb' in navigator)) {
    throw new Error('WebUSB non supporté par ce navigateur.');
  }

  try {
    // Requires user interaction to request device first time
    const devices = await (navigator as any).usb.getDevices();
    let device = devices.find((d: any) => d.vendorId === printer.vid && d.productId === printer.pid);

    if (!device) {
       // Request permission if not already granted
       device = await (navigator as any).usb.requestDevice({ filters: [{ vendorId: printer.vid }] });
    }

    await device.open();
    if (device.configuration === null) await device.selectConfiguration(1);
    await device.claimInterface(0);

    // Usually Endpoint 1 or 2 is the OUT endpoint for printers
    // We would need to inspect device.configuration.interfaces[0].alternate.endpoints
    // Hardcoding endpoint 1 for prototype purposes
    await device.transferOut(1, payload);
    await device.close();

    return true;
  } catch (error) {
    console.error('Print error:', error);
    throw error;
  }
};

export const requestWebUSBDevice = async (): Promise<Printer | null> => {
  if (!('usb' in navigator)) {
    throw new Error('WebUSB non supporté par ce navigateur.');
  }

  try {
    const device = await (navigator as any).usb.requestDevice({ filters: [] });
    return {
      id: `usb-${device.vendorId}-${device.productId}`,
      name: device.productName || `USB Printer (${device.vendorId})`,
      type: 'usb',
      vid: device.vendorId,
      pid: device.productId
    };
  } catch (error) {
    console.error('Request device error:', error);
    return null;
  }
};
