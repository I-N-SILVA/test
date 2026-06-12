'use client';

import * as React from 'react';
import { cn, triggerHaptic } from '@/lib/utils';
import { NATIONS, type SpinResult } from '@/lib/game/wheel';

interface SpinWheelProps {
    /** Called when the wheel needs a result; returns the spin to land on, or null if none. */
    onSpin: () => SpinResult | null;
    /** Fires after the spin animation settles. */
    onLanded: (result: SpinResult) => void;
    disabled?: boolean;
    label: string;
}

// Ink wheel: alternating obsidian tones, flame pointer and hub.
const SEGMENT_COLORS = ['#0A0A0A', '#1C1C1C', '#101010', '#262626'];

export function SpinWheel({ onSpin, onLanded, disabled, label }: SpinWheelProps) {
    const [rotation, setRotation] = React.useState(0);
    const [spinning, setSpinning] = React.useState(false);
    const segment = 360 / NATIONS.length;

    const handleSpin = () => {
        if (spinning || disabled) return;
        const result = onSpin();
        if (!result) return;
        const index = NATIONS.findIndex((n) => n.id === result.nation.id);
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
            onLanded(result);
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
                        background: `conic-gradient(${NATIONS.map(
                            (_, i) =>
                                `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${i * segment}deg ${(i + 1) * segment}deg`,
                        ).join(', ')})`,
                    }}
                >
                    {NATIONS.map((nation, i) => {
                        const angle = i * segment + segment / 2;
                        return (
                            <span
                                key={nation.id}
                                className="absolute left-1/2 top-1/2 text-lg"
                                style={{
                                    transform: `rotate(${angle}deg) translateY(-105px) rotate(-${angle}deg)`,
                                }}
                                aria-hidden
                            >
                                {nation.flag}
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
