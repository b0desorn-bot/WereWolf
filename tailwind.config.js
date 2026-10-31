/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wolf: {
          dark: '#0b0f19',
          card: '#151c2d',
          accent: '#8b5cf6',
          blood: '#dc2626',
          night: '#1e1b4b',
          moon: '#fef08a',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        thai: ['Kanit', 'Prompt', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
