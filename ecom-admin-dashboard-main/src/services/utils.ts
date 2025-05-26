import { twMerge } from 'tailwind-merge'
import clsx from "clsx";

export function cn(...inputs: (string | string[])[]) {
  // Merge class names
  return twMerge(clsx(inputs));
}