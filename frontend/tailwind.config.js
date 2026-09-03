/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        critical: '#ef4444',
      }
    },
  },
  plugins: [],
}
