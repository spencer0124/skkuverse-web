/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // No colour extensions. Two of the six pages use Tailwind classes and the
      // rest carry inline styles, so colours come from @skkuverse/tokens at the
      // point of use. A second palette declared here would be a second source of
      // truth with nothing keeping the two in step.
      fontFamily: {
        sans: ['WantedSans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
