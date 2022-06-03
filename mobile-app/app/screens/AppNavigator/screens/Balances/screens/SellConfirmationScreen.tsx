import { StackScreenProps } from '@react-navigation/stack'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { ThemedTextBasic, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { BalanceParamList } from '../BalancesNavigator'
import { Button } from '@components/Button'
import { View } from '@components'

type Props = StackScreenProps<BalanceParamList, 'SellConfirmationScreen'>

export function SellConfirmationScreen ({ route }: Props): JSX.Element {
  const title = 'CLOSE'
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  return (
    <ThemedView style={tailwind('flex-col h-full text-lg')}>

      <View style={tailwind('flex-grow')} />

      <ThemedTextBasic style={tailwind('flex-grow mx-12 self-center text-xl')}>
        {translate('screens/SellConfirmationScreen', 'Thank you, we have received your sell order.')}
      </ThemedTextBasic>

      <Button
        fill='fill'
        label={translate('screens/common', title)}
        margin='m-8 mb-16'
        onPress={() => navigation.dispatch(StackActions.popToTop())}
        testID={`button_finish_${title}`}
        title={title}
        style={tailwind('flex')}
      />
    </ThemedView>
  )
}
