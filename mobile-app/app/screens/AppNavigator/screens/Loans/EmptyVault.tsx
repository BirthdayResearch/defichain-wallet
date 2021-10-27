import { NavigationProp } from '@react-navigation/core'
import * as React from 'react'
import { RefreshControl } from 'react-native'
import { Button } from '@components/Button'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { LoanParamList } from './LoansNavigator'
import { InfoTextCTA } from '@components/InfoTextCTA'
import { View } from '@components'

interface EmptyVaultProps {
  navigation: NavigationProp<LoanParamList>
  handleRefresh: (nextToken?: string | undefined) => void
  loadingStatus: string
}

export function EmptyVault (props: EmptyVaultProps): JSX.Element {
  // const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const goToVaultsFaq = (): void => {
    // TODO: add navigation to vault FAQ screen
    // navigation.navigate('')
  }
  return (
    <ThemedScrollView
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.loadingStatus === 'loading'}
        />
      }
      contentContainerStyle={tailwind('px-8 pt-32 pb-2 text-center')}
      testID='empty_vault'
    >
      <ThemedIcon
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        iconType='MaterialCommunityIcons'
        name='shield-plus'
        size={44}
        style={tailwind('pb-5 text-center')}
      />

      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/LoansScreen', 'No vault created')}
      </ThemedText>

      <ThemedText style={tailwind('text-sm pb-4 text-center opacity-60')}>
        {translate('screens/LoansScreen', 'To get started, create a vault and add DFI and other tokens as collaterals')}
      </ThemedText>

      <Button
        label={translate('screens/LoansScreen', 'CREATE VAULT')}
        onPress={() => /* props.navigation.navigate('CreateVault') */{}} // TODO: navigate to create vault screen
        testID='button_create_vault'
        title='Create vault'
        margin='m-0 mb-8'
      />
      <View style={tailwind('flex items-center')}>
        <InfoTextCTA
          onPress={goToVaultsFaq}
          text='Learn more about vaults'
          testId='empty_vault_learn_more'
        />
      </View>
    </ThemedScrollView>
  )
}
