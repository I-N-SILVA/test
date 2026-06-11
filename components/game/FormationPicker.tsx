'use client';

import { cn } from '@/lib/utils';
import { FORMATIONS } from '@/lib/game/formations';

interface FormationPickerProps {
    value: string;
    onChange: (id: string) => void;
}

export function FormationPicker({ value, onChange }: FormationPickerProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FORMATIONS.map((formation) => (
                <button
                    key={formation.id}
                    type="button"
                    onClick={() => onChange(formation.id)}
                    className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                        value === formation.id
                            ? 'border-primary-main bg-primary-main/10 shadow-[0_0_16px_rgba(255,215,0,0.2)]'
                            : 'border-border bg-card hover:border-primary-dark',
                    )}
                    aria-pressed={value === formation.id}
                >
                    <span className="relative block h-24 w-full rounded-md bg-pitch-dark/60">
                        {formation.slots.map((slot) => (
                            <span
                                key={slot.id}
                                className={cn(
                                    'absolute h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full',
                                    value === formation.id ? 'bg-primary-main' : 'bg-white/60',
                                )}
                                style={{ left: `${slot.x}%`, bottom: `${slot.y}%` }}
                            />
                        ))}
                    </span>
                    <span className="font-display text-lg">{formation.name}</span>
                </button>
            ))}
        </div>
    );
}
