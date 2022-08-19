import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { OwnedTokenState, TokenState } from '@screens/AppNavigator/screens/Dex/CompositeSwap/CompositeSwapScreen'
import { useDexStabilization } from '@screens/AppNavigator/screens/Dex/hook/DexStabilization'
import { WalletToken } from '@store/wallet'
import { translate } from '@translations'
import { Linking, StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { InfoText } from './InfoText'

interface DfxDexFeeInfoProps {
  token: WalletToken
  style?: StyleProp<ViewStyle>
}

export function DfxDexFeeInfo (props: DfxDexFeeInfoProps): JSX.Element {
  const dfi: TokenState = {
    id: '15',
    reserve: '',
    displaySymbol: 'DUSD',
    symbol: 'DUSD'
  }
  const token: OwnedTokenState = {
    id: props.token.id,
    reserve: '', // props.token.reserve,
    displaySymbol: props.token.symbol,
    symbol: props.token.symbol,
    amount: ''
  }

  const { isFeatureAvailable } = useFeatureFlagContext()
  const isDexStabilizationEnabled = isFeatureAvailable('dusd_dfi_high_fee')
  const {
    dexStabilizationType
  } = useDexStabilization(token, dfi)

  // if (!isDexStabilizationEnabled && dexStabilizationType === 'none') {
  //   return (null)
  // }

  return (
    <>
      {(isDexStabilizationEnabled && dexStabilizationType !== 'none') && (
        <TouchableOpacity
          onPress={async () => await Linking.openURL('https://defichain-wiki.com/wiki/DEX_Fee_structure')}
        >
          <InfoText
            testID='dfx_kyc_info'
            text={translate('components/DfxDexFeeInfo', 'Please note that all sales of dTokens (e.g.dUSD, dCOIN, dTSLA, dSPY..) are subject to a DEX stabilization fee. The crypto tokens such as DFI, dBTC, dETH and stablecoins such as dUSDT / dUSDC are not affected. Further information')}
            style={props.style}
          />
        </TouchableOpacity>
      )}
    </>
  )
}
