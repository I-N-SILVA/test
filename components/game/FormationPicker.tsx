'use client';

import { cn } from '@/lib/utils';
import { FORMATIONS } from '@/lib/game/formations';

const FORMATION_BLURBS: Record<string, string> = {
    '4-3-3': 'Front-foot football. Wingers high, midfield triangle.',
    '4-4-2': 'The classic. Two banks of four, two up top.',
    '4-2-3-1': 'Double pivot, a free 10, one striker to finish it.',
    '3-5-2': 'Wing-backs do the running. Midfield overload.',
    '5-3-2': 'A back five and a counter. Ugly, effective.',
    '4-5-1': 'Compact and stubborn. One chance is enough.',
};

interface FormationPickerProps {
    value: string;
    onChange: (id: string) => void;
}

export function FormationPicker({ value, onChange }: FormationPickerProps) {
    const selected = FORMATIONS.find((f) => f.id === value);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FORMATIONS.map((formation) => (
                    <button
                        key={formation.id}
                        type="button"
                        onClick={() => onChange(formation.id)}
                        className={cn(
                            'flex flex-col items-center gap-2 rounded-md border p-3 transition-all duration-300 ease-expo',
                            value === formation.id
                                ? 'border-flame-1 bg-flame-2/10'
                                : 'border-white/15 bg-white/[0.03] hover:border-white/40',
                        )}
                        aria-pressed={value === formation.id}
                    >
                        <span className="relative block h-20 w-full rounded-sm border border-white/10 bg-black/60">
                            {formation.slots.map((slot) => (
                                <span
                                    key={slot.id}
                                    className={cn(
                                        'absolute h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full',
                                        value === formation.id ? 'bg-flame-1' : 'bg-white/50',
                                    )}
                                    style={{ left: `${slot.x}%`, bottom: `${slot.y}%` }}
                                />
                            ))}
                        </span>
                        <span className="font-mono text-sm">{formation.name}</span>
                    </button>
                ))}
            </div>
            {selected && (
                <p className="text-sm text-white/60">
                    {FORMATION_BLURBS[selected.id] ?? ''}
                </p>
            )}
        </div>
    );
}
