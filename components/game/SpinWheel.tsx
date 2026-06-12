'use client';

import * as React from 'react';
import { cn, triggerHaptic } from '@/lib/utils';

export interface WheelSegment {
    id: string;
    /** Emoji flag or short text rendered on the segment. */
    label: string;
}

export interface WheelSpin<T> {
    /** Which segment to land on (must match a segment id). */
    segmentId: string;
    /** Payload handed back on landing. */
    payload: T;
}

interface SpinWheelProps<T> {
    segments: WheelSegment[];
    /** Called when the wheel needs a result; returns the landing, or null if none. */
    onSpin: () => WheelSpin<T> | null;
    /** Fires after the spin animation settles. */
    onLanded: (payload: T) => void;
    disabled?: boolean;
    label: string;
}

// Ink wheel: alternating obsidian tones, flame pointer and hub.
const SEGMENT_COLORS = ['#0A0A0A', '#1C1C1C', '#101010', '#262626'];

export function SpinWheel<T>({ segments, onSpin, onLanded, disabled, label }: SpinWheelProps<T>) {
    const [rotation, setRotation] = React.useState(0);
    const [spinning, setSpinning] = React.useState(false);
    const count = Math.max(segments.length, 1);
    const segment = 360 / count;
    // Scale the label as the wheel fills up; few segments get readable text.
    const labelClass =
        count > 36
            ? 'text-[10px]'
            : count > 20
              ? 'text-xs'
              : count > 8
                ? 'text-base'
                : 'font-mono text-[11px] uppercase tracking-tight';
    const labelRadius = count > 20 ? 118 : count > 8 ? 100 : 86;

    const handleSpin = () => {
        if (spinning || disabled) return;
        const res = onSpin();
        if (!res) return;
        const index = segments.findIndex((s) => s.id === res.segmentId);
        if (index < 0) return;
        // Land the chosen segment under the top pointer after 4–6 full turns.
        // The turn count is purely cosmetic, so plain Math.random is fine here.
        const target =
            360 * (4 + Math.floor(Math.random() * 3)) + (360 - index * segment - segment / 2);
        setSpinning(true);
        triggerHaptic('light');
        setRotation((prev) => prev + target - (prev % 360));
        window.setTimeout(() => {
            setSpinning(false);
            triggerHaptic('success');
            onLanded(res.payload);
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-64 w-64 sm:h-72 sm:w-72">
                {/* Pointer */}
                <div className="absolute -top-1 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-flame-2" />
                <div
                    className="h-full w-full rounded-full border border-white/20 shadow-flame"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning
                            ? 'transform 3s cubic-bezier(0.12, 0.8, 0.2, 1)'
                            : 'none',
                        background: `conic-gradient(${segments
                            .map(
                                (_, i) =>
                                    `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${i * segment}deg ${(i + 1) * segment}deg`,
                            )
                            .join(', ')})`,
                    }}
                >
                    {segments.map((seg, i) => {
                        const angle = i * segment + segment / 2;
                        return (
                            <span
                                key={seg.id}
                                className={cn('absolute left-1/2 top-1/2 text-white/80', labelClass)}
                                style={{
                                    transform: `rotate(${angle}deg) translateY(-${labelRadius}px) rotate(-${angle}deg)`,
                                }}
                                aria-hidden
                            >
                                {seg.label}
                            </span>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={handleSpin}
                    disabled={spinning || disabled}
                    className={cn(
                        'absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-flame-gradient font-mono text-xs uppercase tracking-caps text-white shadow-flame transition-transform duration-300 ease-expo',
                        !spinning && !disabled && 'hover:scale-105 active:scale-95',
                        (spinning || disabled) && 'opacity-60',
                    )}
                >
                    {spinning ? '···' : 'Spin'}
                </button>
            </div>
            <p className="caption-mono text-white/50">{label}</p>
        </div>
    );
}
