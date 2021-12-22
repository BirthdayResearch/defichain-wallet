import { TouchableOpacity } from '@gorhom/bottom-sheet'
import React from 'react'
import { Platform, TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native'

/**
 *
 * Since using `TouchableOpacity` from `@gorhom/bottom-sheet` will break web version,
 * This component will decide the right touchable component to use
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
