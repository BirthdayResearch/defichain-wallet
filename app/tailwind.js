import { create } from 'tailwind-rn'
import styles from './styles.json'

const fonts = {
  'font-light': {
    fontFamily: 'LightFont',
    fontWeight: '300'
  },
  'font-normal': {
    fontFamily: 'RegularFont',
    fontWeight: '400'
  },
  'font-medium': {
    fontFamily: 'MediumFont',
    fontWeight: '500'
  },
  'font-semibold': {
    fontFamily: 'SemiBoldFont',
    fontWeight: '600'
  },
  'font-bold': {
    fontFamily: 'BoldFont',
    fontWeight: '700'
  }
}

/**
 * @description Allows to use custom tailwind classes
 * @example `tailwind('text-primary')
 * */
const { tailwind, getColor } = create({ ...styles, ...fonts })
export { tailwind, getColor }
