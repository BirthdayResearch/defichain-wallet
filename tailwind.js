import { create } from 'tailwind-rn'
import styles from './styles.json'

/**
 * @description Allows to use custom tailwind classes
 * @example `tailwind('text-primary')
 * */
const { tailwind, getColor } = create({ ...styles })
export { tailwind, getColor }
