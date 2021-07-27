import React, { useEffect, useState, useRef } from 'react'
import tailwind from 'tailwind-rn'
import { View } from '../components'
import { WalletProvider } from '../contexts/WalletContext'
import { useWalletManagementContext } from '../contexts/WalletManagementContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { UnlockWallet } from './AppNavigator/screens/UnlockWallet'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const { wallets, setPasscodePromptInterface, errorCount } = useWalletManagementContext()

  const [isPrompting, setIsPrompting] = useState(false)
  const promptInterface = useRef<(pin: string) => void>()

  useEffect(() => {
    setPasscodePromptInterface({
      prompt: async () => {
        return await new Promise<string>(resolve => {
          promptInterface.current = resolve
          setIsPrompting(true)
        })
      }
    })
  }, [])

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  const appContainerStyle: { height?: number } = {}
  if (isPrompting) {
    // TO BE IMPROVED
    // hackish method to hide <AppNavigator /> WITHOUT losing state, state must retained
    appContainerStyle.height = 0
  }

  return (
    <WalletProvider>
      <WalletContextPasscodePrompt
        isPrompting={isPrompting}
        errorCount={errorCount}
        onPinInput={pin => {
          if (promptInterface.current !== undefined) {
            promptInterface.current(pin)
            setIsPrompting(false)
          }
        }}
      />
      <View style={[tailwind('flex-1'), appContainerStyle]}>
        <AppNavigator />
      </View>
    </WalletProvider>
  )
}

function WalletContextPasscodePrompt ({ isPrompting, onPinInput, errorCount }: { isPrompting: boolean, onPinInput: (pin: string) => void, errorCount: number }): JSX.Element | null {
  /**
   * UI literally stuck on this page until either
   * 1. successfully resolve promise with valid pin (successful decryption)
   * 2. error count hit threshold, wallet wiped, will auto redirect to onboarding again
   */
  if (!isPrompting && errorCount === 0) return null

  return (
    <UnlockWallet
      onPinInput={onPinInput}
      pinLength={6}
      errorCount={errorCount}
    />
  )
}
