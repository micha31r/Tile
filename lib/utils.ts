import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getISODateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDateString(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

export function getDisplayDateString(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getDisplayName(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) {
    return '';
  }

  let displayName = '';
  if (firstName) {
    displayName += firstName;
  }
  if (lastName) {
    displayName += ' ' + lastName;
  }
  return displayName;
}

export function getInitials(firstName?: string, lastName?: string): string | undefined {
  if (!firstName || !lastName) return undefined;
  return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
}

export function getTodayDateString(): string {
  return getDateString(new Date());
}

export function getTodayRangeAsUTC(): string[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startUTC = start.toISOString();
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const endUTC = end.toISOString();

  return [startUTC, endUTC];
}

export function getTimeAgoString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} sec${diffSec === 1 ? '' : 's'}`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'}`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hr${diffHr === 1 ? '' : 's'}`;
}

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;