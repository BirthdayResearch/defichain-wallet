import { PinTextInputV2 } from '@components/PinTextInputV2'
import {
  ThemedActivityIndicatorV2,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { DfTxSigner } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Platform, SafeAreaView, View } from 'react-native'
import { TransactionStatus, USER_CANCELED } from '@screens/TransactionAuthorization/api/transaction_types'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import * as React from 'react'
import Modal from 'react-overlays/Modal'

interface PasscodePromptProps {
  onCancel: (err: string) => void
  title: string
  message: string
  transaction: DfTxSigner
  status: TransactionStatus
  pinLength: number
  onPinInput: (pin: string) => void
  pin: string
  loadingMessage: string
  authorizedTransactionMessage: { title: string, description: string }
  grantedAccessMessage: { title: string, description: string }
  isRetry: boolean
  attemptsRemaining: number
  maxPasscodeAttempt: number
  promptModalName: string
  modalRef: React.RefObject<BottomSheetModalMethods>
  onModalCancel: () => void
  additionalMessage?: string
  additionalMessageUrl?: string
}

const PromptContent = React.memo((props: PasscodePromptProps): JSX.Element => {
  const { isLight } = useThemeContext()
  return (
    <>
      <ThemedTouchableOpacityV2
        light={tailwind('bg-mono-light-v2-100')}
        dark={tailwind('bg-mono-dark-v2-100')}
        onPress={() => props.onCancel(USER_CANCELED)}
        style={[tailwind('items-end pt-6 pr-6'), { borderTopLeftRadius: 15, borderTopRightRadius: 15 }]}
        testID='cancel_authorization'
        disabled={[TransactionStatus.BLOCK, TransactionStatus.SIGNING].includes(props.status)}
      >
        <View
          style={[tailwind(`w-6 h-6 flex justify-center items-center rounded-full ${isLight ? 'border-mono-light-v2-900' : 'border-mono-dark-v2-900'}`), { borderWidth: 1.5 }]}
        >
          <ThemedIcon
            dark={tailwind('text-mono-dark-v2-900')}
            light={tailwind('text-mono-light-v2-900')}
            iconType='MaterialIcons'
            name='close'
            size={16}
          />
        </View>
      </ThemedTouchableOpacityV2>
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-100')}
        dark={tailwind('bg-mono-dark-v2-100')}
        style={tailwind('w-full flex-1 flex-col')}
      >
        <ThemedViewV2
          light={tailwind('bg-mono-light-v2-100')}
          dark={tailwind('bg-mono-dark-v2-100')}
        >
          <ThemedTextV2
            style={[tailwind('text-center font-normal-v2 px-16 pt-3.5'), { marginBottom: props.status !== TransactionStatus.SIGNING && props.status !== TransactionStatus.AUTHORIZED ? 76 : 0 }]}
          >
            {props.title}
          </ThemedTextV2>
          {props.status === TransactionStatus.SIGNING && <ThemedActivityIndicatorV2 style={tailwind('py-4 my-1.5')} />}
          {props.status === TransactionStatus.AUTHORIZED && <SuccessIndicator />}
          <PinTextInputV2
            cellCount={props.pinLength}
            onChange={(pin) => {
                  props.onPinInput(pin)
                }}
            testID='pin_authorize'
            value={props.pin}
          />
          <View style={tailwind('px-8 text-sm text-center mb-14 mt-4')}>
            {// show pin success message
              props.status === TransactionStatus.AUTHORIZED &&
                <ThemedTextV2
                  testID='txn_authorization_message'
                  dark={tailwind('text-mono-dark-v2-700')}
                  light={tailwind('text-mono-light-v2-700')}
                  style={tailwind('px-8 text-sm text-center')}
                >
                  {translate('screens/UnlockWallet', props.grantedAccessMessage.title)}
                </ThemedTextV2>

            }

            {// show loading message
              props.status === TransactionStatus.SIGNING &&
            (
              <ThemedTextV2
                testID='txn_authorization_message'
                dark={tailwind('text-mono-dark-v2-700')}
                light={tailwind('text-mono-light-v2-700')}
                style={tailwind('px-8 text-sm text-center')}
              >
                {translate('screens/UnlockWallet', props.loadingMessage)}
              </ThemedTextV2>
            )
            }
            {// show default message
              (!props.isRetry && props.status !== TransactionStatus.AUTHORIZED && props.status !== TransactionStatus.SIGNING) &&
                <ThemedTextV2
                  testID='txn_authorization_message'
                  dark={tailwind('text-mono-dark-v2-700')}
                  light={tailwind('text-mono-light-v2-700')}
                  style={tailwind('px-8 text-sm text-center')}
                >
                  {translate('screens/UnlockWallet', props.message)}
                </ThemedTextV2>

            }
            {// hide description when passcode is incorrect or verified.
            (props.transaction?.description !== undefined && !props.isRetry && props.status !== TransactionStatus.AUTHORIZED) &&
              (
                <ThemedTextV2
                  testID='txn_authorization_description'
                  dark={tailwind('text-mono-dark-v2-700')}
                  light={tailwind('text-mono-light-v2-700')}
                  style={tailwind('text-sm text-center')}
                >
                  {props.transaction.description}
                </ThemedTextV2>
              )
            }
            {// upon retry: show remaining attempt allowed
                  (props.isRetry && props.attemptsRemaining !== undefined && props.attemptsRemaining !== props.maxPasscodeAttempt && props.status !== TransactionStatus.SIGNING)
                    ? (
                      <ThemedTextV2
                        dark={tailwind('text-red-v2')}
                        light={tailwind('text-red-v2')}
                        style={tailwind('text-center text-sm')}
                        testID='pin_attempt_error'
                      >
                        {translate('screens/PinConfirmation', `${props.attemptsRemaining === 1
                          ? 'Last attempt or your wallet will be unlinked for your security'
                          : 'Wrong passcode entered'}`, { attemptsRemaining: props.attemptsRemaining })}
                      </ThemedTextV2>
                    )
                    : null
                }
            {// on first time: warn user there were accumulated error attempt counter
                  (!props.isRetry && props.attemptsRemaining !== undefined && props.attemptsRemaining !== props.maxPasscodeAttempt && props.status !== TransactionStatus.SIGNING)
                    ? (
                      <ThemedTextV2
                        dark={tailwind('text-red-v2')}
                        light={tailwind('text-red-v2')}
                        style={tailwind('text-center text-sm')}
                        testID='pin_attempt_warning'
                      >
                        {translate('screens/PinConfirmation', `${props.attemptsRemaining === 1
                          ? 'Last attempt or your wallet will be unlinked for your security'
                          : '{{attemptsRemaining}} attempts remaining'}`, { attemptsRemaining: props.attemptsRemaining })}
                      </ThemedTextV2>
                    )
                    : null
                }
          </View>
        </ThemedViewV2>
      </ThemedViewV2>
    </>
  )
})

export const PasscodePrompt = React.memo((props: PasscodePromptProps): JSX.Element => {
  const { isLight } = useThemeContext()
  const containerRef = React.useRef(null)
  const getSnapPoints = (): string[] => {
    if (Platform.OS === 'ios') {
      return ['70%'] // ios measures space without keyboard
    } else if (Platform.OS === 'android') {
      return ['55%'] // android measure space by including keyboard
    }
    return []
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView
        style={tailwind('w-full h-full flex-col absolute z-50 top-0 left-0 ')}
        ref={containerRef}
      >
        <Modal
          container={containerRef}
          show
          renderBackdrop={() => (
            <View style={{
              position: 'absolute',
              borderTopRightRadius: 15,
              borderTopLeftRadius: 15,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'black',
              opacity: 0.6
            }}
            />
          )}
          style={{
            position: 'absolute',
            height: '450px',
            width: '375px',
            zIndex: 50,
            bottom: '0'
          }} // array as value crashes Web Modal
        >
          <View style={tailwind('w-full h-full')}>
            <PromptContent {...props} />
          </View>
        </Modal>
      </SafeAreaView>

    )
  }

  return (
    <BottomSheetModal
      name={props.promptModalName}
      ref={props.modalRef}
      snapPoints={getSnapPoints()}
      handleComponent={null}
      backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
        <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
      )}
      backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
        <View
          {...backgroundProps}
          style={[backgroundProps.style, tailwind(`${isLight ? 'bg-mono-light-v2-100' : 'bg-mono-dark-v2-100'}`), { borderRadius: 15 }]}
        />
      )}
      onChange={(index) => {
        if (index === -1) {
          props.onModalCancel()
        }
      }}
      enablePanDownToClose={false}
    >
      <SafeAreaView
        style={tailwind('w-full h-full flex-col absolute z-50 top-0 left-0')}
      >
        <PromptContent {...props} />
      </SafeAreaView>
    </BottomSheetModal>
  )
})

function SuccessIndicator (): JSX.Element {
  return (
    <View style={tailwind('flex flex-col items-center py-4 my-1.5')}>
      <View
        style={tailwind('h-6 w-6 rounded-full flex justify-center items-center border bg-green-v2 border-green-v2')}
      >
        <ThemedIcon
          size={18}
          name='check'
          iconType='Feather'
          dark={tailwind('text-mono-dark-v2-00')}
          light={tailwind('text-mono-light-v2-00')}
        />
      </View>
    </View>
  )
}
