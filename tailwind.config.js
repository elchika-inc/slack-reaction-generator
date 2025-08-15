/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'rainbow': 'rainbow 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-up': 'bounce-up 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        rainbow: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'
          },
        },
        'bounce-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}