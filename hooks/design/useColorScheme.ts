import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native'

/**
 * @return {NonNullable<ColorSchemeName>} return non-null ColorSchemeName
 */
export function useColorScheme (): NonNullable<ColorSchemeName> {
  return _useColorScheme() as NonNullable<ColorSchemeName>
}
