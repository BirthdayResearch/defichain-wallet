import React, { ReactElement, ReactNode, useCallback, useRef, useEffect } from 'react'
import { tailwind } from '@tailwind'
import { TouchableOpacity, View, Platform } from 'react-native'
import { BottomSheetModal as Modal, BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@contexts/ThemeProvider'
import { ThemedProps } from './themed'

type Props = ThemedProps & BottomSheetModalProps & {
  triggerComponent: ReactNode
  children: ReactElement
}

export const BottomSheetModal = (props: Props): JSX.Element => {
  const bottomSheetModalRef = useRef<Modal>(null)
  const { isLight } = useThemeContext()
  const {
    name,
    style,
    index = 1,
    triggerComponent,
    snapPoints = ['100%', '50%'],
    light = tailwind('bg-gray-100 text-black'),
    dark = tailwind('bg-gray-900 text-white text-opacity-90')
  } = props

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        bottomSheetModalRef.current?.close()
      }
    }
  }, [])

  if (Platform.OS === 'web') {
    return <></>
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handlePresentModalPress}
      >
        {triggerComponent}
      </TouchableOpacity>
      <Modal
        index={index}
        name={name}
        ref={bottomSheetModalRef}
        style={style}
        snapPoints={snapPoints}
        stackBehavior='replace'
        backgroundStyle={[isLight ? light : dark]}
      >
        {props.children}
      </Modal>
    </View>
  )
}
