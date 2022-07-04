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

export function DfxConversionInfo (props: DfxConversionInfoProps): JSX.Element {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(props.token.symbol === 'DFI')
  }, [props.token])

  return (
    show
    ? (
      <TouchableOpacity>
        <InfoText
          testID='dfx_kyc_info'
          text={translate('components/DfxConversionInfo', 'Please note that currently only DFI UTXO can be sold. You can exchange DFI tokens in DFI UTXO by clicking on DFI in the portfolio.')}
          style={props.style}
        />
      </TouchableOpacity>)
    : (<></>)
  )
}
