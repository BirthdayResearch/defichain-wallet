import { PinTextInput } from '@components/PinTextInput'
import { ThemedActivityIndicator, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { useThemeContext } from '@contexts/ThemeProvider'
import { DfTxSigner } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { Platform, SafeAreaView, View } from 'react-native'
import { Status } from './TransactionAuthorization'

interface TransactionAuthorizationUIProps {
  onCancel: () => void
  message: string
  transaction: DfTxSigner
  status: Status
  pinLength: number
  onPinInput: (pin: string) => void
  pin: string
  loadingMessage: string
  isRetry: boolean
  attemptsRemaining: number
  maxPasscodeAttempt: number
}

export function TransactionAuthorizationUI (props: TransactionAuthorizationUIProps): JSX.Element {
  const { isLight } = useThemeContext()

  return (
    <SafeAreaView
      style={tailwind('w-full h-full flex-col', `${isLight ? 'bg-gray-100' : 'bg-gray-800'}`)}
    >
      <View
        style={{
          paddingTop: Platform.select({
            android: 25
          })
        }}
      >
        <ThemedTouchableOpacity
          dark={tailwind('bg-gray-800 border-b border-gray-700')}
          light={tailwind('bg-gray-100 border-b border-gray-200')}
          onPress={props.onCancel}
          style={tailwind('p-4')}
          testID='cancel_authorization'
        >
          <ThemedText
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('font-bold')}
          >
            {translate('components/UnlockWallet', 'CANCEL')}
          </ThemedText>
        </ThemedTouchableOpacity>
      </View>

      <ThemedView
        dark={tailwind('bg-gray-900')}
        light={tailwind('bg-white')}
        style={tailwind('w-full flex-1 flex-col pt-8')}
      >
        <ThemedText
          style={tailwind('text-center text-xl font-bold')}
        >
          {translate('screens/UnlockWallet', 'Enter passcode')}
        </ThemedText>

        <View style={tailwind('p-4 px-8 text-sm text-center mb-6')}>
          <ThemedText
            testID='txn_authorization_message'
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('p-4 px-8 text-sm text-center mb-2')}
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
          props.status === 'PIN' && (
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
          message={props.status === 'SIGNING' ? props.loadingMessage : undefined}
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
      </ThemedView>
    </SafeAreaView>
  )
}

function Loading ({ message }: { message?: string }): JSX.Element | null {
  if (message === undefined) {
    return null
  }
  return (
    <View style={tailwind('flex-row justify-center p-2')}>
      <ThemedActivityIndicator />

      <ThemedText style={tailwind('ml-2')}>
        {message}
      </ThemedText>
    </View>
  )
}
