import { Button } from '@components/Button'
import { ThemedScrollView, ThemedText } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { LoanParamList } from '../../LoansNavigator'

export function EmptyActiveLoans (): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('px-8 py-16 text-center')}
      testID='empty_active_loans'
    >
      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('components/EmptyActiveLoans', 'No active loans')}
      </ThemedText>

      <ThemedText style={tailwind('text-sm pb-4 text-center opacity-60')}>
        {translate('components/EmptyActiveLoans', 'Browse for available loan tokens and start using this vault as collateral')}
      </ThemedText>

      <Button
        label={translate('components/EmptyActiveLoans', 'BROWSE LOANS')}
        onPress={() => {
          // TODO: replace navigation to browse loans tab in loans screen
          navigation.navigate({
            name: 'VaultDetailScreen',
            params: {
              vaultId: '22ffasd5ca123123123123123121231061',
              emptyActiveLoans: false
            },
            merge: true
          })
        }}
        testID='button_browse_loans'
        title='Browse loans'
        margin='m-0 mb-4'
      />
    </ThemedScrollView>
  )
}
