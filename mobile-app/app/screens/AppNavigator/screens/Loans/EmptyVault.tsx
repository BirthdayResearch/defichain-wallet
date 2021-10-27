import { NavigationProp } from '@react-navigation/native'
import * as React from 'react'
import { RefreshControl } from 'react-native'
import { Button } from '@components/Button'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { LoanParamList } from './LoansNavigator'

interface EmptyVaultProps {
  navigation: NavigationProp<LoanParamList>
  handleRefresh: (nextToken?: string | undefined) => void
  loadingStatus: string
}

export function EmptyVault (props: EmptyVaultProps): JSX.Element {
  return (
    <ThemedScrollView
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.loadingStatus === 'loading'}
        />
      }
      style={tailwind('px-8 pt-32 pb-2 text-center')}
      testID='empty_vault'
    >
      <ThemedIcon
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        iconType='MaterialCommunityIcons'
        name='shield-off'
        size={44}
        style={tailwind('pb-5 text-center')}
      />

      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/LoansScreen', 'No vault created')}
      </ThemedText>

      <ThemedText style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/LoansScreen', 'To get started, create a vault and add DFI and other tokens as collaterals')}
      </ThemedText>

      <Button
        label={translate('screens/LoansScreen', 'CREATE VAULT')}
        onPress={() => props.navigation.navigate('CreateVault')}
        testID='button_create_vault'
        title='Create vault'
      />
    </ThemedScrollView>
  )
}
