import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
const unused = "lint error"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

