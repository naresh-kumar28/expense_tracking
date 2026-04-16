/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Yaha dark mode ko class based define kar rahe hai
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          900: '#4c1d95',
        },
        dark: {
          bg: '#121212',
          card: '#1e1e1e',
          text: '#f3f4f6',
          border: '#374151'
        }
      }
    },
  },
  plugins: [],
}
