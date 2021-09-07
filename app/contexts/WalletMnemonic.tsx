import React, { createContext, useContext, useState } from 'react'
import { MnemonicUnprotected } from '../api/wallet'

interface WalletMnemonicI {
  mnemonicWords: string[]
  updateMnemonicWords: () => void
}

const WalletMnemonic = createContext<WalletMnemonicI>(undefined as any)

export function useWalletMnemonicConext (): WalletMnemonicI {
  return useContext(WalletMnemonic)
}

const getMenmonicSet = (): string[] => {
  return MnemonicUnprotected.generateWords()
}

export function WalletMnemonicProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [mnemonicWords, setWords] = useState<string[]>(getMenmonicSet())

  if (mnemonicWords?.length === 0) {
    return null
  }

  const context: WalletMnemonicI = {
    mnemonicWords: mnemonicWords,
    updateMnemonicWords (): void {
      setWords(getMenmonicSet())
    }
  }

  return (
    <WalletMnemonic.Provider value={context}>
      {props.children}
    </WalletMnemonic.Provider>
  )
}
