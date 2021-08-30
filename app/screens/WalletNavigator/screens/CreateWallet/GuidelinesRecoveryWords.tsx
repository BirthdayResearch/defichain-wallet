import React from 'react'
import { ThemedScrollView, ThemedText } from '../../../../components/themed'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'

export function GuidelinesRecoveryWords (): JSX.Element {
  return (
    <ThemedScrollView
      light={tailwind('bg-white')} dark={tailwind('bg-gray-900')}
      style={tailwind('flex-1 p-4 pt-6')}
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >{translate('screens/GuidelinesRecoveryWords', 'What are recovery words?')}
      </ThemedText>
      <ThemedText
        style={tailwind('mt-2')}
      >{translate('screens/GuidelinesRecoveryWords', 'Your unique 24 recovery words is a human-readable representation of your wallet private key, generated from a list of 2048 words in the BIP-39 standard.')}
      </ThemedText>
      <ThemedText
        style={tailwind('mt-5')}
      >{translate('screens/GuidelinesRecoveryWords', 'You will need your recovery words to restore your wallet on, for example, a new mobile device. Think of them as keys to your wallet and funds.')}
      </ThemedText>
      <ThemedText
        style={tailwind('mt-5')}
      >{translate('screens/GuidelinesRecoveryWords', 'If you lose your recovery words, you will not be able to restore your wallet, and you will lose access to your wallet and funds.')}
      </ThemedText>
      <ThemedText
        style={tailwind('mt-5 mb-12')}
      >{translate('screens/GuidelinesRecoveryWords', 'It is important that you write down your recovery words legibly and in the correct order. Store your recovery words safely and securely, away from prying eyes. You may want to think about keeping it safe from fire as well.')}
      </ThemedText>
    </ThemedScrollView>
  )
}
