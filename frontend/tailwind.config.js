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
        'flat': '0 1px 2px 0 rgba(0,0,0,0.1)',
        'elevated': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
