const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const flowbite = require('flowbite/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/flowbite-react/**/*.js'],
  plugins: [forms, typography, flowbite],
  theme: {
    extend: {
      colors: {
        'default-kyso': '#244362',
        'default-kyso-disable': 'rgba(36, 67, 97, 0.7)',
        'default-kyso-focus': 'rgb(31, 136, 219)',
        'kyso-primary': '#234361',
        'kyso-secondary': '#FFFFFF',
        'kyso-secondary-border': '#234361',
      },
    },
  },
};
