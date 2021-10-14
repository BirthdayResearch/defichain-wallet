module.exports = {
  purge: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['"IBM Plex Sans"', 'sans-serif']
    },
    colors: {
      black: '#000000',
      white: '#FFFFFF',
      primary: {
        50: '#FFE5F7',
        100: '#FFCCEF',
        200: '#FF99DF',
        300: '#FF66CF',
        400: '#FF33BF',
        500: '#FF00AF',
        600: '#D60093',
        700: '#AD0077',
        800: '#85005B',
        900: '#5C003F'
      },
      secondary: {
        50: '#E8DEFF',
        100: '#D9C7FF',
        200: '#B999FF',
        300: '#9A6BFF',
        400: '#7A3DFF',
        500: '#5B0FFF',
        600: '#4A00EB',
        700: '#3E00C7',
        800: '#3400A3',
        900: '#28007F'
      },
      gray: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717'
      },
      red: {
        50: '#FFF2F2',
        100: '#FFE6E6',
        200: '#FFBFBF',
        300: '#FF9999',
        500: '#FF0000',
        600: '#E60000'
      },
      orange: {
        50: '#FFFAF4',
        100: '#FFF5EA',
        200: '#FFE5CA',
        300: '#FFD5A9',
        500: '#FF9629',
        600: '#E68725'
      },
      green: {
        50: '#F2FBF4',
        100: '#E6F7E8',
        200: '#C0ECC6',
        300: '#9AE1A4',
        500: '#02B31B',
        600: '#02A118'
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['last']
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ]
}
