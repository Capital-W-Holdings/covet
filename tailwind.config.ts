import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#020912',
          offwhite: '#fcfcfc',
          cream: '#f5f5f4',
          muted: '#737373',
        },
      },
      fontFamily: {
        mono: ['Anonymous Pro', 'ui-monospace', 'monospace'],
        heading: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
