import { Text, View } from '../../../components/Themed'
import tailwind from 'tailwind-rn'
import { translate } from '../../../translations'
import * as React from 'react'

export function WalletSetupScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/WalletSetupScreen', 'Wallet Setup')}
      </Text>
    </View>
  )
}
