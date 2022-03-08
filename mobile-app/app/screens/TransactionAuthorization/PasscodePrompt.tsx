import { PinTextInput } from '@components/PinTextInput'
import { ThemedActivityIndicator, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { DfTxSigner } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Platform, SafeAreaView, View } from 'react-native'
import { TransactionStatus, USER_CANCELED } from '@screens/TransactionAuthorization/api/transaction_types'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import * as React from 'react'

interface PasscodePromptProps {
  onCancel: (err: string) => void
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
}

const PromptContent = React.memo((props: PasscodePromptProps): JSX.Element => {
  return (
    <SafeAreaView
      style={tailwind('w-full h-full flex-col')}
    >
      <ThemedTouchableOpacity
        dark={tailwind('bg-gray-900')}
        light={tailwind('bg-white')}
        onPress={() => props.onCancel(USER_CANCELED)}
        style={tailwind('items-end pt-2 pr-2')}
        testID='cancel_authorization'
        disabled={[TransactionStatus.BLOCK, TransactionStatus.SIGNING].includes(props.status)}
      >
        <ThemedIcon
          dark={tailwind('text-white')}
          light={tailwind('text-black')}
          iconType='MaterialIcons'
          name='close'
          size={26}
        />
      </ThemedTouchableOpacity>

      <ThemedView
        dark={tailwind('bg-gray-900')}
        light={tailwind('bg-white')}
        style={tailwind('w-full flex-1 flex-col')}
      >

        {props.status === TransactionStatus.AUTHORIZED
          ? (
            <SuccessMessage
              message={props.transaction === undefined ? props.grantedAccessMessage : props.authorizedTransactionMessage}
            />
          )
          : (
            <ThemedView
              light={tailwind('bg-white')}
            >
              <ThemedText
                style={tailwind('text-center text-xl font-bold px-1')}
              >
                {props.transaction === undefined
                  ? translate('screens/UnlockWallet', 'Sign to verify access')
                  : translate('screens/TransactionAuthorization', 'Sign Transaction')}
              </ThemedText>

              <View style={tailwind('px-8 text-sm text-center mb-6')}>
                <ThemedText
                  testID='txn_authorization_message'
                  dark={tailwind('text-gray-400')}
                  light={tailwind('text-gray-500')}
                  style={tailwind('p-2 px-8 text-sm text-center mb-2')}
                >
                  {props.message}
                </ThemedText>

                {
                  props.transaction?.description !== undefined && (
                    <ThemedText
                      testID='txn_authorization_description'
                      dark={tailwind('text-gray-400')}
                      light={tailwind('text-gray-500')}
                      style={tailwind('text-sm text-center')}
                    >
                      {props.transaction.description}
                    </ThemedText>
                  )
                }
              </View>

              {
                props.status === TransactionStatus.PIN && (
                  <PinTextInput
                    cellCount={props.pinLength}
                    onChange={(pin) => {
                      props.onPinInput(pin)
                    }}
                    testID='pin_authorize'
                    value={props.pin}
                  />
                )
              }

              <Loading
                message={props.status === TransactionStatus.SIGNING ? props.loadingMessage : undefined}
              />

              {// upon retry: show remaining attempt allowed
                (props.isRetry && props.attemptsRemaining !== undefined && props.attemptsRemaining !== props.maxPasscodeAttempt)
                  ? (
                    <ThemedText
                      dark={tailwind('text-darkerror-500')}
                      light={tailwind('text-error-500')}
                      style={tailwind('text-center text-sm font-bold mt-5')}
                      testID='pin_attempt_error'
                    >
                      {translate('screens/PinConfirmation', `${props.attemptsRemaining === 1
                        ? 'Last attempt or your wallet will be unlinked for your security'
                        : 'Incorrect passcode. {{attemptsRemaining}} attempts remaining'}`, { attemptsRemaining: props.attemptsRemaining })}
                    </ThemedText>
                  )
                  : null
              }

              {// on first time: warn user there were accumulated error attempt counter
                (!props.isRetry && props.attemptsRemaining !== undefined && props.attemptsRemaining !== props.maxPasscodeAttempt)
                  ? (
                    <ThemedText
                      dark={tailwind('text-darkerror-500')}
                      light={tailwind('text-error-500')}
                      style={tailwind('text-center text-sm font-bold mt-5')}
                      testID='pin_attempt_warning'
                    >
                      {translate('screens/PinConfirmation', `${props.attemptsRemaining === 1
                        ? 'Last attempt or your wallet will be unlinked for your security'
                        : '{{attemptsRemaining}} attempts remaining'}`, { attemptsRemaining: props.attemptsRemaining })}
                    </ThemedText>
                  )
                  : null
              }
            </ThemedView>)}
      </ThemedView>
    </SafeAreaView>
  )
})

export const PasscodePrompt = React.memo((props: PasscodePromptProps): JSX.Element => {
  const { isLight } = useThemeContext()
  const getSnapPoints = (): string[] => {
    if (Platform.OS === 'ios') {
      return ['65%'] // ios measures space without keyboard
    } else if (Platform.OS === 'android') {
      return ['50%'] // android measure space by including keyboard
    }
    return []
  }

  if (Platform.OS === 'web') {
    return (<PromptContent {...props} />)
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
          style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-t rounded`)]}
        />
      )}
      onChange={(index) => {
        if (index === -1) {
          props.onModalCancel()
        }
      }}
      enablePanDownToClose={false}
    >
      <PromptContent {...props} />
    </BottomSheetModal>
  )
})

function SuccessMessage ({ message }: { message?: { title: string, description: string } }): JSX.Element | null {
  if (message === undefined) {
    return null
  }

  return (
    <View style={tailwind('flex-col items-center p-6')}>
      <ThemedIcon
        dark={tailwind('text-darksuccess-500')}
        iconType='MaterialIcons'
        light={tailwind('text-success-500')}
        name='check-circle-outline'
        size={26}
      />
      <ThemedText style={tailwind('text-center text-xl font-bold mt-5')}>
        {message.title}
      </ThemedText>

      <ThemedText style={tailwind('text-sm text-center')}>
        {message.description}
      </ThemedText>
    </View>
  )
}

function Loading ({ message }: { message?: string }): JSX.Element | null {
  if (message === undefined) {
    return null
  }
  return (
    <View style={tailwind('flex-row justify-center p-2')}>
      <ThemedActivityIndicator />

      <ThemedText style={tailwind('ml-2 text-sm')}>
        {message}
      </ThemedText>
    </View>
  )
}
