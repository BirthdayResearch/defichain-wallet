import { ThemedScrollView, ThemedSectionTitle, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'

export function CreateVaultScreen (): JSX.Element {
  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('py-8 px-4')}
    >
      <ThemedSectionTitle
        text={translate('screens/CreateVaultScreen', 'Choose loan scheme for your vault')}
        style={tailwind('text-xl font-semibold mb-2')}
      />
      <ThemedText style={tailwind('mb-6')}>
        {translate('screens/CreateVaultScreen', 'This sets the minimum collateral ratio and the vault’s interest rate.')}
      </ThemedText>
    </ThemedScrollView>
  )
}
