import { translate } from '@translations'
import { StyleProp, ViewStyle } from 'react-native'
import { InfoText } from './InfoText'

interface DfxDexFeeInfoProps {
  style?: StyleProp<ViewStyle>
}

export function DfxDexFeeInfo (props: DfxDexFeeInfoProps): JSX.Element {
  return (
    <InfoText
      testID='dfx_kyc_info'
      text={translate('components/DfxDexFeeInfo', 'Please note that all sales of dTokens(e.g.dUSD, dCOIN, dTSLA, dSPY..) are subject to a DEX stabilization fee.The crypto tokens such as DFI, dBTC, dETH and stablecoins such as dUSDT / dUSDC are not affected.Further information')}
      style={props.style}
    />
  )
}
