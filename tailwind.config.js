/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        highlight: {
          '0%': { backgroundColor: '#fef08a' },
          '100%': { backgroundColor: '#ffffff' },
        }
      },
      animation: {
        'fadeIn': 'fadeIn 300ms ease-in',
        highlight: 'highlight 1s ease-out'
      }
    },
  },
  plugins: [],
};
