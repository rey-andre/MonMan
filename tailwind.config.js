/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink2)',
          light: 'var(--ink3)',
        },
        brand: {
          blue: 'var(--blue)',
          sky: 'var(--sky)',
          mist: 'var(--mist)',
          orange: 'var(--orange)',
          peach: 'var(--peach)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 10px 30px rgba(79, 140, 255, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-hover': '0 14px 34px rgba(79, 140, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'phone': '0 24px 60px rgba(79, 140, 255, 0.22)',
        'button-glow': '0 6px 16px rgba(79, 140, 255, 0.4)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '28px',
        '5xl': '44px',
      }
    },
  },
  plugins: [],
}
