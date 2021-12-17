import React, { ReactElement, useCallback, useRef, useEffect } from 'react'
import { tailwind } from '@tailwind'
import { TouchableOpacity, View, Platform } from 'react-native'
import { BottomSheetBackgroundProps, BottomSheetModal as Modal, BottomSheetModalProps, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ThemedIcon, ThemedProps } from './themed'
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

  const closeModal = useCallback(() => {
    if (!isWeb) {
      dismiss(name)
    }
  }, [])

  useEffect(() => {
    return () => {
      closeModal()
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
          style={style}
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          stackBehavior='replace'
          backgroundStyle={[isLight ? light : dark]}
          backdropComponent={(backdropProps: BottomSheetBackgroundProps) => (
            <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
          )}
          backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
            <View {...backgroundProps} style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} border-t rounded`)]} />
          )}
        >
          <View style={tailwind('absolute flex-row justify-end right-5 top-1 w-full z-10')}>
            <TouchableOpacity onPress={closeModal}>
              <ThemedIcon
                size={24}
                name='close'
                iconType='MaterialIcons'
                dark={tailwind('text-white text-opacity-70')}
                light={tailwind('text-gray-600')}
              />
            </TouchableOpacity>
          </View>
          {children}
        </Modal>
      )}
    </View>
  )
}
