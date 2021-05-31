import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native'

/**
 * @return {NonNullable<ColorSchemeName>} return non-null ColorSchemeName
 * @deprecated to be introduced later
 */
export function useColorScheme (): NonNullable<ColorSchemeName> {
  return _useColorScheme() as NonNullable<ColorSchemeName>
}
