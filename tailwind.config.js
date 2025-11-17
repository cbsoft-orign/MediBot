/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Brand palette: dark green, golden yellow, white and light green
      colors: {
        primary: {
          50: '#edf9f3',
          100: '#d6f4e6',
          200: '#aee9cc',
          300: '#7ce0a9',
          400: '#3fc06f',
          500: '#1f9b56',
          600: '#157544',
          700: '#0f5633',
          800: '#0a3f25',
          900: '#07321d' // dark green (brand)
        },
        golden: {
          50: '#fffdf6',
          100: '#fff8e6',
          200: '#fff0c2',
          300: '#ffe39a',
          400: '#ffd268',
          500: '#e6b73a',
          600: '#c49225',
          700: '#9a6f17',
          800: '#73520f',
          900: '#533b0b' // golden yellow
        },
        'light-green': {
          50: '#f6fff9',
          100: '#ecfff2',
          200: '#d6ffe6',
          300: '#b8ffd1',
          400: '#9dfabb',
          500: '#7ef29f',
          600: '#61d987',
          700: '#47b86a',
          800: '#2f9450',
          900: '#156f39'
        },
        neutral: {
          50: '#ffffff',
          100: '#f8faf9',
          200: '#f1f3f2',
          300: '#e6e9e7',
          400: '#cfd3d0',
          500: '#a8aeaa',
          600: '#6f7672',
          700: '#4b514f',
          800: '#2f3433',
          900: '#0f1312'
        }
      },
      boxShadow: {
        card: '0 8px 30px rgba(9, 30, 15, 0.12)'
      },
      borderRadius: {
        xl: '1rem'
      },
      animation: {
        'progress': 'progress 2s ease-in-out infinite'
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      }
    }
  },
  plugins: [],
}
