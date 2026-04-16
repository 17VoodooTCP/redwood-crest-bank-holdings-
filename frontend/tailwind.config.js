/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0A1E3F',
          darkblue: '#06132A',
          header: '#0A1E3F',
          light: '#f4f5f7',
          text: '#222222',
          gray: '#717171',
          border: '#dcdcdc',
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
