/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f1f3f6', // Flipkart light gray background
        card: '#ffffff',
        primary: '#2874f0', // Flipkart Blue
        primaryHover: '#1c5ccb',
        accent: '#ffe500', // Flipkart Yellow
        success: '#388e3c', // Material green often used in eCommerce
        warning: '#ff9000', // Deep orange for warnings
        critical: '#ff6161', // Red for critical errors
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'], // Flipkart uses Roboto heavily
      },
      boxShadow: {
        'flat': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        'glow-primary': '0 0 20px -2px rgba(40, 116, 240, 0.35)',
        'glow-success': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
        'glow-danger': '0 0 20px -2px rgba(239, 68, 68, 0.35)',
        'inner-lcd': 'inset 0 2px 8px rgba(0, 0, 0, 0.75)',
      },
      transitionTimingFunction: {
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
}
