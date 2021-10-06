import React, { ReactElement, useCallback, useRef, useEffect } from 'react'
import { tailwind } from '@tailwind'
import { TouchableOpacity, View, Platform } from 'react-native'
import { BottomSheetModal as Modal, BottomSheetModalProps, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@contexts/ThemeProvider'
import { ThemedProps } from './themed'
import { WalletAlert } from './WalletAlert'

type Props = ThemedProps & BottomSheetModalProps & {
  triggerComponent: ReactElement
  children: ReactElement
  alertInfo?: { title: string, message: string }
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
    alertInfo,
    snapPoints = ['100%', '50%'],
    light = tailwind('bg-gray-100 text-black'),
    dark = tailwind('bg-gray-600 text-white text-opacity-90')
  } = props
  const isWeb = Platform.OS === 'web'

  const openModal = useCallback(() => {
    if (!isWeb) {
      bottomSheetModalRef.current?.present()
    } else if (alertInfo != null) {
      WalletAlert(alertInfo)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (!isWeb) {
        dismiss(name)
      }
    }
  }, [])

  return (
    <View>
      <TouchableOpacity onPress={openModal}>
        {triggerComponent}
      </TouchableOpacity>
      {!isWeb && (
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
      )}
    </View>
  )
}
