import { ReactElement, useCallback, useRef, useEffect } from 'react'
import { tailwind } from '@tailwind'
import { View, Platform, ViewProps, StyleProp } from 'react-native'
import { BottomSheetBackgroundProps, BottomSheetModal as Modal, BottomSheetModalProps, useBottomSheetModal, TouchableOpacity } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ThemedIcon, ThemedProps } from './themed'
import { WalletAlert } from './WalletAlert'
import { ScrollView } from 'react-native-gesture-handler'

type Props = ThemedProps & BottomSheetModalProps & {
  triggerComponent: ReactElement
  children: ReactElement
  alertInfo?: { title: string, message: string }
  closeButtonStyle?: StyleProp<ViewProps>
  enableScroll?: boolean
}

export const BottomSheetModal = (props: Props): JSX.Element => {
  const bottomSheetModalRef = useRef<Modal>(null)
  const { dismiss } = useBottomSheetModal()
  const { isLight } = useThemeContext()
  const {
    name,
    style,
    children,
    closeButtonStyle,
    handleComponent,
    triggerComponent,
    alertInfo,
    snapPoints = ['100%', '50%'],
    light = tailwind('bg-gray-100 text-black'),
    dark = tailwind('bg-gray-600 text-white text-opacity-90'),
    enableScroll,
    ...otherModalProps
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
            <View {...backgroundProps} style={[backgroundProps.style, tailwind(`${isLight ? 'border-gray-200' : 'border-gray-700'} rounded-lg-v2`)]} />
          )}
          handleComponent={handleComponent}
          {...otherModalProps}
        >
          <ScrollView
            contentContainerStyle={tailwind(`pb-7 px-5 relative ${handleComponent === null ? 'pt-7' : 'pt-5'}`)}
            scrollEnabled={enableScroll}
          >
            <View style={[tailwind('flex-row justify-end w-full z-10'), closeButtonStyle]}>
              <TouchableOpacity onPress={closeModal}>
                <ThemedIcon
                  dark={tailwind('text-mono-dark-v2-900')}
                  light={tailwind('text-mono-light-v2-900')}
                  iconType='Feather'
                  name='x-circle'
                  size={24}
                />
              </TouchableOpacity>
            </View>
            {children}
          </ScrollView>
        </Modal>
      )}
    </View>
  )
}
