module.exports = {
  content: [
    './index.html',
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zumthor-100': '#e8eff7',
        'zumthor-150': '#dfe8f2',
        'zumthor-200': '#d9d9d9',
        'light-background': '#F9F9F9',
        'light-blue': '#D3E6F8'
      },
      spacing: {
        '9/16': '56.25%',
        '3/4': '75%',
        '1/1': '100%',
      },
      fontFamily: {
        //inter: ['Inter', 'sans-serif'],
        //'architects-daughter': ['"Architects Daughter"', 'sans-serif'],
        teachers: ['"Teachers"', "sans-serif"]
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
        '6xl': '4rem',
      },
      inset: {
        'full': '100%',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.025em',
        widest: '0.3em',
      },
      minWidth: {
        '10': '2.5rem',
      },
      scale: {
        '98': '.98'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
};
