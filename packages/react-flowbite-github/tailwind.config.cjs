module.exports =  {
  darkMode: 'media',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/flowbite/**/*.js',
    '../../node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    '../../node_modules/@slimplate/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
