import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...i: ClassValue[]) {
  return twMerge(clsx(i));
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}
export function formatINR(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
}
