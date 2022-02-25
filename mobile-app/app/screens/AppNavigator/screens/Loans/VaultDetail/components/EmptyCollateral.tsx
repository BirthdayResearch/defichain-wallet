import { Button } from '@components/Button'
import { ThemedScrollView, ThemedText } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

import { LoanParamList } from '../../LoansNavigator'

export function EmptyCollateral (props: {vaultId: string}): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('px-12 py-16 text-center')}
      testID='empty_active_loans'
    >
      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('components/EmptyCollateral', 'No collateral')}
      </ThemedText>

      <ThemedText style={tailwind('text-sm pb-4 text-center opacity-60')}>
        {translate('components/EmptyCollateral', 'Add DFI and tokens as collateral to get started with loans.')}
      </ThemedText>

      <Button
        label={translate('components/EmptyCollateral', 'ADD COLLATERAL')}
        onPress={() => {
          navigation.navigate({
            name: 'EditCollateralScreen',
            params: {
              vaultId: props.vaultId
            }
          })
        }}
        testID='button_add_collateral'
        margin='m-0 mb-4'
      />
    </ThemedScrollView>
  )
}
