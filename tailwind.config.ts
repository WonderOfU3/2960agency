import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        buster: ['"TAN Buster"', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        page:   '#0a0a08',
        card:   '#191714',
        accent: '#D94F2A',
        yellow: '#FCFAA6',
      },
    },
  },
  plugins: [],
}

export default config
