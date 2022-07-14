import { StackScreenProps } from '@react-navigation/stack'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { ThemedTextBasic, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { PortfolioParamList } from '../PortfolioNavigator'
import { Button } from '@components/Button'
import { View } from '@components'

type Props = StackScreenProps<PortfolioParamList, 'SellConfirmationScreen'>

export function SellConfirmationScreen ({ route }: Props): JSX.Element {
  const title = translate('components/Button', 'CLOSE')
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()

  return (
    <ThemedView style={tailwind('flex-col h-full text-lg')}>

      <View style={tailwind('flex-grow')} />

      <ThemedTextBasic style={tailwind('flex-grow mx-12 self-center text-xl')}>
        {translate('screens/SellConfirmationScreen', 'We will sell your assets now and prepare the payout to your bank transaction.')}
      </ThemedTextBasic>

      <Button
        fill='fill'
        label={translate('screens/common', title)}
        margin='m-8 mb-24'
        onPress={() => navigation.dispatch(StackActions.popToTop())}
        testID={`button_finish_${title}`}
        title={title}
        style={tailwind('flex')}
      />
    </ThemedView>
  )
}
