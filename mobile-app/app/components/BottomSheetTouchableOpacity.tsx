import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { Platform, TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native'

/**
 * Use this for any `TouchableOpacity` within `@gorhom/bottom-sheet`
 *
 *
 * Since using `TouchableOpacity` from `@gorhom/bottom-sheet` will break e2e test in web version,
 * this component will decide the right touchable component to use in mobile as advised in the DOC
 * @reference https://gorhom.github.io/react-native-bottom-sheet/troubleshooting/#pressables--touchables-are-not-working-on-android
 */
export function BottomSheetTouchableOpacity (props: TouchableOpacityProps): JSX.Element {
  return (
    <>
      {Platform.OS === 'ios' || Platform.OS === 'android'
        ? (
          <TouchableOpacity {...props} />
        )
        : (
          <RNTouchableOpacity {...props} />
        )}
    </>

  )
}
