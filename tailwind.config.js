/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    'node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Press Start 2P"', 'cursive'],
        'sans': ['"Orbitron"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('preline/plugin'),
    require('daisyui'),
  ],
  daisyui: {
    themes: ["synthwave"], // Using synthwave dark theme for arcade/gaming aesthetic
  },
}
