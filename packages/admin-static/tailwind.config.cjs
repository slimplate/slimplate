module.exports = {
  darkMode: 'media',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/flowbite/**/*.js',
    '../../node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    '../../node_modules/@slimplate/react-flowbite-github/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
