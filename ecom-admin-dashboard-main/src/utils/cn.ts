import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values into a single string and resolves Tailwind CSS class conflicts.
 */
export default function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}