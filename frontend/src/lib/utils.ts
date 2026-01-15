import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePositiveInt(
  value: string | undefined | null,
  defaultValue: number
): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : defaultValue;
}
