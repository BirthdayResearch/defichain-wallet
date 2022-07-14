import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { ConversionMode } from '@screens/AppNavigator/screens/Balances/screens/ConvertScreen'
import { WalletToken } from '@store/wallet'
import { translate } from '@translations'
import { useEffect, useState } from 'react'

import { StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { InfoText } from './InfoText'

interface DfxConversionInfoProps {
  token: WalletToken
  style?: StyleProp<ViewStyle>
}

export function DfxConversionInfo ({
  token,
  style
}: DfxConversionInfoProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(token.symbol === 'DFI')
  }, [token])

  return (
    show
    ? (
      <TouchableOpacity
        onPress={() => {
          const mode: ConversionMode = 'accountToUtxos'
          navigation.navigate({
            name: 'Convert',
            params: { mode },
            merge: true
          })
        }}
      >
        <InfoText
          testID='dfx_kyc_info'
          text={translate('components/DfxConversionInfo', 'Please note that currently only DFI UTXO can be sold. You can exchange DFI tokens by clicking here.')}
          style={style}
        />
      </TouchableOpacity>)
    : (<></>)
  )
}
