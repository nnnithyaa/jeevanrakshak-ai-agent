/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f3',
          100: '#fce4e7',
          200: '#f9ccd2',
          300: '#f4a5af',
          400: '#ec7384',
          500: '#e04a60',
          600: '#c9354c',
          700: '#a92740',
          800: '#8a2238',
          900: '#722035',
          950: '#3d0d18',
        },
        navy: {
          50: '#f0f4f9',
          100: '#e0e9f2',
          200: '#c7d6e6',
          300: '#9fb8d2',
          400: '#6f93b7',
          500: '#4d73a0',
          600: '#3a5a85',
          700: '#30496c',
          800: '#1f3450',
          900: '#162540',
          950: '#0d1628',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(15, 23, 42, 0.08), 0 2px 4px 0 rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
