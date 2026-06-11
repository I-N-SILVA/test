// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme');

// PLYAZ Design System, "Kinetic Order": obsidian + flame, structure + spark.
// Paper canvas for editorial surfaces, ink for the game. Flame used surgically.
const flame = {
    1: '#FFA132', // sunset amber
    2: '#FF4D00', // deep flame
    3: '#E62E00', // hottest moments only
    ember: '#FFD9B3',
};
const neutral = {
    obsidian: '#000000',
    charcoal: '#262626',
    graphite: '#4A4A4A',
    stone: '#8A8580',
    pebble: '#C9C4BC',
    bone: '#ECE7DD',
    paperwarm: '#F3EFE7',
    paper: '#FBFAF7',
};

/** @type {import("tailwindcss").Config } */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: ['class'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['General Sans', 'Plus Jakarta Sans', ...fontFamily.sans],
                serif: ['Playfair Display', 'Georgia', ...fontFamily.serif],
                mono: ['JetBrains Mono', ...fontFamily.mono],
            },
            colors: {
                flame,
                obsidian: neutral.obsidian,
                charcoal: neutral.charcoal,
                graphite: neutral.graphite,
                stone: neutral.stone,
                pebble: neutral.pebble,
                bone: neutral.bone,
                paper: neutral.paper,
                paperwarm: neutral.paperwarm,
                cobalt: '#2A6FDB',
                success: '#1F8A5B',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: flame[2],
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
            },
            // The system is mostly square. Pill is reserved for actions.
            borderRadius: {
                lg: '8px',
                md: '4px',
                sm: '2px',
            },
            letterSpacing: {
                caps: '0.22em',
                display: '-0.045em',
            },
            boxShadow: {
                1: '0 1px 2px rgba(0,0,0,.04)',
                2: '0 6px 16px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
                3: '0 12px 40px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.04)',
                flame: '0 12px 40px rgba(255, 77, 0, .22)',
            },
            transitionTimingFunction: {
                expo: 'cubic-bezier(0.19, 1, 0.22, 1)',
                'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
            keyframes: {
                'score-pop': {
                    '0%': { transform: 'scale(0.4)', opacity: '0' },
                    '70%': { transform: 'scale(1.15)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-up': {
                    from: { transform: 'translateY(16px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                'score-pop': 'score-pop 0.5s cubic-bezier(0.19, 1, 0.22, 1) both',
                'slide-up': 'slide-up 0.4s cubic-bezier(0.19, 1, 0.22, 1) both',
            },
        },
    },
    plugins: [],
};
