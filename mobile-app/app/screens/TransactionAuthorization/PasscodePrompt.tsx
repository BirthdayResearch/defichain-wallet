import { PinTextInput } from '@components/PinTextInput'
import { ThemedActivityIndicator, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { useThemeContext } from '@contexts/ThemeProvider'
import { DfTxSigner } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { Platform, SafeAreaView, View } from 'react-native'
import { TransactionStatus } from '@screens/TransactionAuthorization/api/transaction_types'

interface PasscodePromptProps {
  onCancel: () => void
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
}

export function PasscodePrompt (props: PasscodePromptProps): JSX.Element {
  const { isLight } = useThemeContext()

  return (
    <SafeAreaView
      style={tailwind('w-full h-full flex-col', `${isLight ? 'bg-gray-100' : 'bg-blue-800'}`)}
    >
      <View
        style={{
          paddingTop: Platform.select({
            android: 25
          })
        }}
      >
        <ThemedTouchableOpacity
          dark={tailwind('bg-blue-900')}
          light={tailwind('bg-white')}
          onPress={props.onCancel}
          style={tailwind('flex flex-row-reverse p-4')}
          testID='cancel_authorization'
        >
          <ThemedIcon
            dark={tailwind('text-white')}
            light={tailwind('text-black')}
            iconType='MaterialIcons'
            name='close'
            size={26}
          />
        </ThemedTouchableOpacity>
      </View>

      <ThemedView
        dark={tailwind('bg-blue-900')}
        light={tailwind('bg-white')}
        style={tailwind('w-full flex-1 flex-col pt-8')}
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
}

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
