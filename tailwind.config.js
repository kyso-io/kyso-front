const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const flowbite = require('flowbite/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/flowbite-react/**/*.js'],
  plugins: [forms, typography, flowbite],
};
