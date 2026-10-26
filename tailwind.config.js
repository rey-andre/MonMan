/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f2547',
          muted: '#41587f',
          light: '#627d9e',
        },
        brand: {
          blue: '#4f8cff',
          sky: '#a9cdff',
          mist: '#eaf3ff',
          orange: '#ff9a4d',
          peach: '#ffd2ad',
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
