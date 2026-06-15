import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Triggers haptic feedback on supported devices.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'medium') {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    const patterns: Record<string, number[]> = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [10, 30, 10],
        error: [50, 50, 50],
    };
    navigator.vibrate(patterns[type]);
}

/** True when the user has asked the OS to minimise animation. */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
