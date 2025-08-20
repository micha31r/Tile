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

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;