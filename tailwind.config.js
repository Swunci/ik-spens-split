/** @type {import('tailwindcss').Config} */

export const darkMode = ['class'];
export const content = ['./src/**/*.{js,ts,jsx,tsx}'];
export const theme = {
  container: {
    center: true,
    padding: '2rem',
    screens: {
      '2xl': '1400px',
    },
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '4rem',
  },
  extend: {
    colors: {
      alice: {
        base: '#F0F8FF',
        main: '#D5E0FF',
        accent: '#7E7DFF',
        secondary: '#B6C9FF',
      },
    },
    maxWidth: {
      '1/12': ' 8.333333%',
      '2/12': '16.666667%',
      '3/12': '25%',
      '4/12': '16.666667%',
      '5/12': '41.666667%',
      '6/12': '50%',
      '7/12': '58.333333%',
      '8/12': '66.666667%',
      '9/12': '75%',
      '10/12': '83.333333%',
      '11/12': '91.666667%',
    },
    screens: {
      betterhover: { raw: '(hover: hover)' },
    },
  },
};
export const plugins = [
  ({ addUtilities }) => {
    addUtilities({
      '.mobile-disable-highlight': {
        '-webkit-tap-highlight-color': 'transparent',
      },
    });
  },
];
