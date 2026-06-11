// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme');

// Design system ported from PLYAZ League ("Kinetic Order"), re-themed for 48-0:
// gold primary, charcoal secondary, pitch-green surface accents.
const gold = {
    lighter: '#FFF3C4',
    light: '#FFE066',
    main: '#FFD700',
    dark: '#D4AF37',
    darker: '#8A7019',
};
const charcoal = {
    lighter: '#9CA3AF',
    light: '#4B5563',
    main: '#262626',
    dark: '#171717',
    darker: '#0A0A0A',
};
const pitch = {
    lighter: '#34D399',
    light: '#0E9F6E',
    main: '#0B6E4F',
    dark: '#08503A',
    darker: '#042A1F',
};

/** @type {import("tailwindcss").Config } */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: ['class'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['General Sans', ...fontFamily.sans],
                display: ['Bebas Neue', 'General Sans', ...fontFamily.sans],
            },
            colors: {
                primary: {
                    lighter: gold.lighter,
                    light: gold.light,
                    main: gold.main,
                    dark: gold.dark,
                    darker: gold.darker,
                    100: gold.lighter,
                    200: gold.lighter,
                    300: gold.light,
                    400: gold.light,
                    500: gold.main,
                    600: gold.main,
                    700: gold.dark,
                    800: gold.dark,
                    900: gold.darker,
                },
                secondary: {
                    lighter: charcoal.lighter,
                    light: charcoal.light,
                    main: charcoal.main,
                    dark: charcoal.dark,
                    darker: charcoal.darker,
                    100: charcoal.lighter,
                    200: charcoal.lighter,
                    300: charcoal.light,
                    400: charcoal.light,
                    500: charcoal.main,
                    600: charcoal.main,
                    700: charcoal.dark,
                    800: charcoal.dark,
                    900: charcoal.darker,
                },
                pitch,
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: gold.dark,
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
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
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
                'score-pop': 'score-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                'slide-up': 'slide-up 0.35s ease-out both',
            },
        },
    },
    plugins: [],
};
