const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
const flowbite = require('flowbite/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/flowbite-react/**/*.js'],
  plugins: [forms, typography, flowbite],
  theme: {
    extend: {
      colors: {
        white: '#fff',
        gray: {
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827',
        },
        indigo: {
          600: '#4f46e5',
          700: '#1d4ed8',
          900: '#312e81',
        },
        kyso: {
          500: 'rgba(36, 67, 97, 0.7)',
          600: '#244362',
          700: '#162c40',
        },
        rose: {
          100: '#ffe4e6',
          700: '#be123c',
        },
        'primary-color': 'kyso-600',
        'primary-text-color': 'gray-900',
        'primary-link-color': 'indigo-600',
        'primary-link-hover-color': 'indigo-700',
        'primary-disable-btn': 'kyso-500',
        'primary-hover-button': 'kyso-700',
        'primary-hover-ring-color': 'indigo-900',
        'secondary-color': 'gray-500',
        'secondary-bg-button-color': 'white',
        'secondary-bg-button-hover': 'gray-100',
        'dangerous-color': 'rose-700',
        'dangerous-bg-button-hover': 'rose-100',
      },
    },
  },
};
