/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        darkBg: '#090d16', // Deep OLED Cyber Midnight
        darkCard: '#0f172a', // Sleek dark slate
        darkCardSecondary: '#162033', // Secondary dark tile
        darkBorder: '#1e293b', // Subdued dark border
        cyanGlow: '#00ffcc', // Cyber glow accent
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'flat': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        'premium-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 4px 10px -2px rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 20px -2px rgba(40, 116, 240, 0.45)',
        'glow-cyan': '0 0 25px -2px rgba(0, 255, 204, 0.45)',
        'glow-success': '0 0 20px -2px rgba(16, 185, 129, 0.45)',
        'glow-danger': '0 0 20px -2px rgba(239, 68, 68, 0.45)',
        'inner-lcd': 'inset 0 2px 10px rgba(0, 0, 0, 0.85)',
      },
      transitionTimingFunction: {
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
}
