/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 'mine-shaft' resolves to CSS variables so the whole UI can flip between
        // dark (default) and light (.light-theme on <html>) without editing components.
        // The variable values (and their inversion for light) live in index.css.
        'mine-shaft': {
          '50': 'rgb(var(--ms-50) / <alpha-value>)',
          '100': 'rgb(var(--ms-100) / <alpha-value>)',
          '200': 'rgb(var(--ms-200) / <alpha-value>)',
          '300': 'rgb(var(--ms-300) / <alpha-value>)',
          '400': 'rgb(var(--ms-400) / <alpha-value>)',
          '500': 'rgb(var(--ms-500) / <alpha-value>)',
          '600': 'rgb(var(--ms-600) / <alpha-value>)',
          '700': 'rgb(var(--ms-700) / <alpha-value>)',
          '800': 'rgb(var(--ms-800) / <alpha-value>)',
          '900': 'rgb(var(--ms-900) / <alpha-value>)',
          '950': 'rgb(var(--ms-950) / <alpha-value>)',
        },
        'bright-sun': {
        '50': '#fffbeb',
        '100': '#fff3c6',
        '200': '#ffe588',
        '300': '#ffd149',
        '400': '#ffbd20',
        '500': '#f99b07',
        '600': '#dd7302',
        '700': '#b75006',
        '800': '#943c0c',
        '900': '#7a330d',
        '950': '#461902',
    },
    
      },
      keyframes: {
        'option-animation': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'option-animation': 'option-animation 200ms ease forwards',
      },
    },
    screens: {
      'xsm': '350px',
      'xs': '476px',
      'sm': '640px',
      'md': '768px',
      'bs': '900px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',


      '2xl-mx': { 'max': '1535px' },
      'xl-mx': { 'max': '1279px' },
      'lg-mx': { 'max': '1023px' },
      'bs-mx': { 'max': '900px' },
      'md-mx': { 'max': '767px' },
      'sm-mx': { 'max': '639px' },
      'xs-mx': { 'max': '475px' },
      'xsm-mx': { 'max': '349px' }
    }
  },
  plugins: [],
}