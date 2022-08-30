import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { OwnedTokenState, TokenState } from '@screens/AppNavigator/screens/Dex/CompositeSwap/CompositeSwapScreen'
import { useDexStabilization } from '@screens/AppNavigator/screens/Dex/hook/DexStabilization'
import { WalletToken } from '@store/wallet'
import { translate } from '@translations'
import { useEffect, useMemo } from 'react'
import { Linking, StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { InfoText } from './InfoText'

interface DfxDexFeeInfoProps {
  token: WalletToken
  style?: StyleProp<ViewStyle>
  getDexFee?: (fee: string) => void
}

export function DfxDexFeeInfo (props: DfxDexFeeInfoProps): JSX.Element {
  const dfi: TokenState = useMemo(() => {
    return {
      id: '0_unified',
      reserve: '',
      displaySymbol: 'DFI',
      symbol: 'DFI'
    }
  }, [])

  // const token: OwnedTokenState = useMemo(() => {
  //   return {
  //     id: props.token.id,
  //     reserve: '',
  //     displaySymbol: props.token.displaySymbol,
  //     symbol: props.token.symbol,
  //     amount: props.token.amount
  //   }
  // }, [props.token])

  const dusd: OwnedTokenState = useMemo(() => {
    return {
      id: '11',
      reserve: '',
      displaySymbol: 'DUSD',
      symbol: 'DUSD',
      amount: 'props.token.amount'
    }
  }, [])

  // dex stabilization
  const { isFeatureAvailable } = useFeatureFlagContext()
  const isDexStabilizationEnabled = isFeatureAvailable('dusd_dex_high_fee')
  const {
    dexStabilization: {
      // dexStabilizationType,
      dexStabilizationFee
    }
  } = useDexStabilization(dusd, dfi)

  const isCrypto = (): boolean => ['DFI', 'dBTC', 'dETH', 'dUSDT', 'dUSDC', 'dLTC', 'dBCH', 'dDOGE'].includes(props.token.displaySymbol)

  const returnDexFee = (): void => {
    props.getDexFee?.(isCrypto() ? '0' : dexStabilizationFee)
  }

  useEffect(() => {
    returnDexFee()
  }, [props.token])

  return (
    <>
      {(isDexStabilizationEnabled && !isCrypto() /* && dexStabilizationType !== 'none' */) && (
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
