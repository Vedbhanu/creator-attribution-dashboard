/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        neo: {
          bg: '#FDFCF8',
          alt: '#F7F4EC',
          ink: '#111111',
          gray: '#4B4B4B',
          light: '#8A8A8A',
          pink: '#EC4899',
          'pink-dark': '#D6317C',
          blue: '#4A4FE0',
          yellow: '#F6D74C',
          card: '#FFFFFF',
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px #111111',
        'neo-sm': '2px 2px 0px #111111',
        'neo-lg': '6px 6px 0px #111111',
      }
    },
  },
  plugins: [],
};
