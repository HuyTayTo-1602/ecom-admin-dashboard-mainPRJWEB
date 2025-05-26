module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // This is crucial for class-based dark mode
  theme: { extend: {} },
  plugins: [],
  variants: {
    extend: {
      backgroundColor: ['active'],
      textColor: ['active'],
      borderColor: ['active'],
    },
  },
};