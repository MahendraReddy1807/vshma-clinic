import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a unique booking reference: VSHMA-XXXXXX */
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'VSHMA-';
  const random = new Uint32Array(6);
  crypto.getRandomValues(random);
  for (let i = 0; i < random.length; i++) {
    result += chars.charAt(random[i] % chars.length);
  }
  return result;
}

/** Format a date string for display */
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format a date string shortly */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Validate a 10-digit Indian mobile number */
export function validateIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/** Generate WhatsApp URL with pre-filled booking message */
export function generateWhatsAppUrl(data: {
  name: string;
  phone: string;
  date: string;
  time?: string;
  type: string;
  reference: string;
}): string {
  const message = `Hello VSHMA,

I would like to book a consultation.

Name: ${data.name}
Mobile: ${data.phone}
Preferred Date: ${data.date}
Preferred Time: ${data.time || 'Not specified'}
Consultation Type: ${data.type}
Booking Reference: ${data.reference}

Thank you.`;

  return `https://wa.me/917416001477?text=${encodeURIComponent(message)}`;
}

/** Generate WhatsApp URL to contact a specific patient */
export function generatePatientWhatsAppUrl(phone: string, bookingRef: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const fullNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  const message = `Hello, this is VSHMA Homeopathy Clinic regarding your appointment (Ref: ${bookingRef}).`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

/** Sanitize input string – strip HTML tags */
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/** Get today's date in YYYY-MM-DD format */
export function getTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
