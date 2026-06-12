/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lira: {
          navy: '#0f172a',      // Primary dark slate / navy
          navyLight: '#1e293b', // Lighter slate for sidebar/menus
          gold: '#d97706',      // Gold accent for indicators/buttons
          goldHover: '#b45309', // Hover state gold
          grey: '#64748b',      // Slate grey for labels/text
          bg: '#f8fafc',        // Page background
          border: '#e2e8f0'     // Border separator color
        }
      }
    },
  },
  plugins: [],
}
