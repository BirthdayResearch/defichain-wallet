import React, { ReactElement, ReactNode, useCallback, useRef, useEffect } from 'react'
import { tailwind } from '@tailwind'
import { TouchableOpacity, View, Platform } from 'react-native'
import { BottomSheetModal as Modal, BottomSheetModalProps, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@contexts/ThemeProvider'
import { ThemedProps } from './themed'

type Props = ThemedProps & BottomSheetModalProps & {
  triggerComponent: ReactNode
  children: ReactElement
}

export const BottomSheetModal = (props: Props): JSX.Element => {
  const bottomSheetModalRef = useRef<Modal>(null)
  const { dismiss } = useBottomSheetModal()
  const { isLight } = useThemeContext()
  const {
    name,
    style,
    children,
    triggerComponent,
    snapPoints = ['100%', '50%'],
    light = tailwind('bg-gray-100 text-black'),
    dark = tailwind('bg-gray-900 text-white text-opacity-90')
  } = props

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        dismiss(name)
      }
    }
  }, [])

  if (Platform.OS === 'web') {
    return <></>
  }

  return (
    <View>
      <TouchableOpacity onPress={openModal}>
        {triggerComponent}
      </TouchableOpacity>
      <Modal
        name={name}
        ref={bottomSheetModalRef}
        style={style}
        snapPoints={snapPoints}
        stackBehavior='replace'
        backgroundStyle={[isLight ? light : dark]}
      >
        {children}
      </Modal>
    </View>
  )
}
