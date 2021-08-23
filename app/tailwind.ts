import classNames, { Argument } from 'classnames'
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
 * Please do not edit this file.
 *
 * If you want to use extend tailwind, please edit 'tailwind.config.js' and run 'npx create-tailwind-rn'
 * in this directory after you have edited the file.
 */
const created = create({ ...styles, ...fonts })

/**
 * Allows to use custom tailwind classes.
 * @example `tailwind('text-primary bg-white')
 * @example `tailwind('text-primary', 'bg-black')
 * @example `tailwind(['text-primary', 'bg-black'])
 * @example `tailwind({'text-primary': true}, {'bg-black': false})
 * @example `tailwind('bg-white', {'text-primary': true}, {'bg-black': false})
 *
 * Please do not edit this file.
 *
 * If you want to use extend tailwind, please edit 'tailwind.config.js' and run 'npx create-tailwind-rn'
 * in this directory after you have edited the file.
 * @param {...Argument[]} args
 */
export function tailwind (...args: Argument[]): { [key: string]: string } {
  return created.tailwind(classNames(args))
}

export const getColor = created.getColor
