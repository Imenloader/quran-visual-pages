import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTime(timeStr: string, now: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
}
