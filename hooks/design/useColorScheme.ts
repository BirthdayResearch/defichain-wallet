import { ColorSchemeName } from 'react-native'

/**
 * @return {NonNullable<ColorSchemeName>} return non-null ColorSchemeName
 */
export function useColorScheme (): NonNullable<ColorSchemeName> {
  return 'light'
  // return _useColorScheme() as NonNullable<ColorSchemeName>
}
