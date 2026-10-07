/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'library-bg': '#FAF8F4',
        surface: '#FFFFFF',
        'surface-warm': '#F4EFE6',
        'surface-sand': '#EDE6DA',
        primary: {
          DEFAULT: '#1F4D3A', // Deep green primary
          hover: '#183D2E',
          light: '#EAF1ED',
          muted: '#2E654E',
        },
        accent: {
          DEFAULT: '#B8893B', // Muted gold accent
          hover: '#9E742E',
          light: '#F8F3EA',
          border: '#D9BE8E',
        },
        slate: {
          900: '#1E2226',
          800: '#2B2F33', // Slate body text
          700: '#41474D',
          600: '#5A626A', // Slate secondary text
          500: '#757E88',
          400: '#9DA6B0',
          300: '#C7CFD6',
          200: '#E1E5EA',
          100: '#F0F3F6',
          50: '#F7F9FA',
        },
        border: {
          DEFAULT: '#E5DFD5', // Subtle warm border
          subtle: '#EAE5DC',
          dark: '#D1C8BA',
        },
        overdue: {
          DEFAULT: '#A83232', // Brick red
          hover: '#8C2626',
          light: '#FAEDED',
          border: '#E8B6B6',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(43, 47, 51, 0.04)',
        DEFAULT: '0 1px 3px 0 rgba(43, 47, 51, 0.06)',
        md: '0 4px 6px -1px rgba(43, 47, 51, 0.06)',
        none: 'none',
      },
    },
  },
  plugins: [],
}
