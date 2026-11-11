/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1a1a1a',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#5c5650',
                    foreground: '#ffffff',
                },
                accent: {
                    DEFAULT: '#c4a35a',
                    foreground: '#1a1a1a',
                },
                background: '#f7f5f2',
                foreground: '#1a1a1a',
                surface: {
                    DEFAULT: '#ffffff',
                    raised: '#ffffff',
                    sunken: '#efebe6',
                },
                muted: {
                    DEFAULT: '#e8e4df',
                    foreground: '#6b6560',
                },
                border: {
                    DEFAULT: '#e0dbd4',
                    strong: '#cfc8bf',
                },
                ring: '#1a1a1a',
                admin: {
                    primary: '#3b82f6',
                    'on-primary': '#ffffff',
                    background: '#f3f4f6',
                    surface: '#ffffff',
                },
                success: {
                    DEFAULT: '#2f6f4e',
                    foreground: '#1f4d36',
                    muted: '#e8f0eb',
                },
                warning: {
                    DEFAULT: '#b45309',
                    foreground: '#92400e',
                    muted: '#fef3c7',
                },
                danger: {
                    DEFAULT: '#b42318',
                    foreground: '#912018',
                    muted: '#fee4e2',
                },
                info: {
                    DEFAULT: '#3b6ea5',
                    foreground: '#1e4976',
                    muted: '#e8f1f8',
                },
                badge: {
                    sale: '#b42318',
                    'sale-muted': '#fee4e2',
                    new: '#2f6f4e',
                    'new-muted': '#e8f0eb',
                },
                skeleton: {
                    DEFAULT: '#e8e4df',
                    shine: '#f7f5f2',
                },
            },
            fontFamily: {
                sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                sm: '0 2px 8px rgba(26, 26, 26, 0.05)',
                md: '0 8px 24px rgba(26, 26, 26, 0.06)',
                lg: '0 16px 40px rgba(26, 26, 26, 0.08)',
                focus: '0 0 0 3px rgba(26, 26, 26, 0.2)',
            },
            maxWidth: {
                content: '72rem',
            },
            screens: {
                '2xl': '1440px',
            },
        },
    },
    plugins: [],
};
