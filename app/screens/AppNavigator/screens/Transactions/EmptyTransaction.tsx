import * as React from 'react'
import { View } from 'react-native'
import { NavigationProp } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TransactionsParamList } from './TransactionsNavigator'
import { tailwind } from '../../../../tailwind'
import { Text } from '../../../../components'
import { translate } from '../../../../translations'
import { Button } from '../../../../components/Button'

interface EmptyTransactionProps {
  navigation: NavigationProp<TransactionsParamList>
}

export function EmptyTransaction (props: EmptyTransactionProps): JSX.Element {
  return (
    <View
      testID='empty_transaction'
      style={tailwind('px-8 pt-32 pb-2 text-center')}
    >
      <MaterialCommunityIcons name='folder-alert' size={44} style={tailwind('pb-5 text-center text-black')} />
      <Text style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/TransactionsScreen', 'No transactions yet')}
      </Text>
      <Text style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/TransactionsScreen', 'Start transacting with your wallet. All transactions made will be displayed here.')}
      </Text>
      <Button
        testID='button_receive_coins'
        title='Receive Coins'
        onPress={() => props.navigation.navigate('Receive')}
        label={translate('screens/TransactionsScreen', 'RECEIVE COINS')}
      />
    </View>
  )
}
