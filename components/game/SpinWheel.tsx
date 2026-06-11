'use client';

import * as React from 'react';
import { cn, triggerHaptic } from '@/lib/utils';
import { NATIONS } from '@/lib/game/wheel';
import type { Nation } from '@/lib/game/types';

interface SpinWheelProps {
    /** Called when the wheel needs a result; returns the nation to land on, or null if none. */
    onSpin: () => Nation | null;
    /** Fires after the spin animation settles on a nation. */
    onLanded: (nation: Nation) => void;
    disabled?: boolean;
    label: string;
}

const SEGMENT_COLORS = ['#0B6E4F', '#171717', '#0E9F6E', '#262626'];

export function SpinWheel({ onSpin, onLanded, disabled, label }: SpinWheelProps) {
    const [rotation, setRotation] = React.useState(0);
    const [spinning, setSpinning] = React.useState(false);
    const segment = 360 / NATIONS.length;

    const handleSpin = () => {
        if (spinning || disabled) return;
        const nation = onSpin();
        if (!nation) return;
        const index = NATIONS.findIndex((n) => n.id === nation.id);
        // Land the chosen segment under the top pointer after 4–6 full turns.
        const target =
            360 * (4 + Math.floor(Math.random() * 3)) + (360 - index * segment - segment / 2);
        setSpinning(true);
        triggerHaptic('light');
        setRotation((prev) => prev + target - (prev % 360));
        window.setTimeout(() => {
            setSpinning(false);
            triggerHaptic('success');
            onLanded(nation);
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-64 w-64 sm:h-72 sm:w-72">
                {/* Pointer */}
                <div className="absolute -top-1 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-primary-main" />
                <div
                    className="h-full w-full rounded-full border-4 border-primary-dark shadow-[0_0_40px_rgba(255,215,0,0.25)]"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? 'transform 3s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
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
                        'absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-gradient font-display text-lg uppercase text-black shadow-lg transition-transform',
                        !spinning && !disabled && 'hover:scale-105 active:scale-95',
                        (spinning || disabled) && 'opacity-60',
                    )}
                >
                    {spinning ? '...' : 'Spin'}
                </button>
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}
