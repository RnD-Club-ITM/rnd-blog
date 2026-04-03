import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                'spark-burst': {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(1.5)', opacity: '0' },
                },
                'spark-pulse': {
                    '0%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(var(--primary-rgb), 0))' },
                    '50%': { transform: 'scale(1.25)', filter: 'drop-shadow(0 0 15px var(--primary))' },
                    '100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(var(--primary-rgb), 0))' },
                },
            },
            animation: {
                'spark-burst': 'spark-burst 0.5s ease-out forwards',
                'spark-pulse': 'spark-pulse 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [
        // Custom neobrutal utilities
        function ({ addUtilities }: any) {
            addUtilities({
                '.border-brutal': {
                    'border-width': '2px',
                    'border-color': 'var(--brutal-border)',
                    'border-style': 'solid',
                },
                '.border-brutal-thick': {
                    'border-width': '4px',
                    'border-color': 'var(--brutal-border)',
                    'border-style': 'solid',
                },
                '.shadow-brutal': {
                    'box-shadow': '4px 4px 0 0 var(--brutal-shadow)',
                },
                '.shadow-brutal-sm': {
                    'box-shadow': '2px 2px 0 0 var(--brutal-shadow)',
                },
                '.shadow-brutal-lg': {
                    'box-shadow': '6px 6px 0 0 var(--brutal-shadow)',
                },
                '.shadow-brutal-xl': {
                    'box-shadow': '8px 8px 0 0 var(--brutal-shadow)',
                },
                '.text-outlined': {
                    'color': 'transparent',
                    '-webkit-text-stroke': '2px currentColor',
                    'text-stroke': '2px currentColor',
                },
            });
        },
    ],
};

export default config;
