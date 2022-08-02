import { View, StyleProp, TextStyle } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ViewPoolDetailsModal } from './ViewPoolDetailsModal'
import { ViewPoolAmountRow } from './ViewPoolAmountRow'
import { WalletToken } from '@store/wallet'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { PortfolioButtonGroupTabKey } from '@screens/AppNavigator/screens/Portfolio/components/TotalPortfolio'
import { useDenominationCurrency } from '@screens/AppNavigator/screens/Portfolio/hooks/PortfolioCurrency'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import BigNumber from 'bignumber.js'

interface PoolInfoModalProps {
    pairData: PoolPairData
    poolInfo: WalletToken
    totalPooledTokenA: string
    totalPooledTokenB: string
    infoIconStyle?: StyleProp<TextStyle>
}

export function ViewPoolRemoveLiquidityDetails ({ pairData, poolInfo, totalPooledTokenA, totalPooledTokenB }: PoolInfoModalProps): JSX.Element {
    const { denominationCurrency } = useDenominationCurrency()
    const { getTokenPrice } = useTokenPrice()
    const getUSDValue = (
      amount: BigNumber,
      symbol: string,
      isLPs: boolean = false
    ): BigNumber => {
      return getTokenPrice(symbol, amount, isLPs)
    }

    return (
      <ViewPoolDetailsModal
        pairData={pairData}
        triggerLabel={translate('screens/RemoveLiquidity', 'View pool share')}
      >
        <View style={tailwind('mb-3')}>
          <ViewPoolAmountRow
            label={translate('screens/RemoveLiquidity', 'Pool share')}
            amount={poolInfo.amount}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-900'),
              light: tailwind('text-mono-light-v2-900')
            }}
            suffix={` ${poolInfo.displaySymbol}`}
            testID='Pool_share_amount'
          />
          <ViewPoolAmountRow
            amount='3.123'
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-700'),
              light: tailwind('text-mono-light-v2-700')
            }}
            prefix='('
            suffix='%)'
            testID='Pool_share_amount'
          />
        </View>
        <View style={tailwind('mb-3')}>
          <ViewPoolAmountRow
            label={translate('screens/RemoveLiquidity', `Pooled ${pairData.tokenA.displaySymbol}`)}
            amount={totalPooledTokenA}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-900'),
              light: tailwind('text-mono-light-v2-900')
            }}
            testID='Pool_share_amount'
          />
          <ViewPoolAmountRow
            amount={getUSDValue(new BigNumber(totalPooledTokenA), pairData.tokenA.symbol).toFixed(2)}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-700'),
              light: tailwind('text-mono-light-v2-700')
            }}
            prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
            suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
            testID='Pool_share_amount'
          />
        </View>
        <View style={tailwind('mb-3')}>
          <ViewPoolAmountRow
            label={translate('screens/RemoveLiquidity', `Pooled ${pairData.tokenB.displaySymbol}`)}
            amount={totalPooledTokenB}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-900'),
              light: tailwind('text-mono-light-v2-900')
            }}
            testID='Pool_share_amount'
          />
          <ViewPoolAmountRow
            amount={getUSDValue(new BigNumber(totalPooledTokenB), pairData.tokenB.symbol).toFixed(2)}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-700'),
              light: tailwind('text-mono-light-v2-700')
            }}
            prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
            suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
            testID='Pool_share_amount'
          />
        </View>
        {pairData?.apr?.total !== undefined && pairData?.apr?.total !== null && (
          <ViewPoolAmountRow
            label='APR'
            amount={new BigNumber(isNaN(pairData.apr.total) ? 0 : pairData.apr.total).times(100).toFixed(2)}
            valueThemeProps={{
              dark: tailwind('text-darksuccess-500'),
              light: tailwind('text-success-500')
            }}
            valueTextStyle={tailwind('font-semibold-v2')}
            suffix='%'
            testID='Pool_share_amount'
          />
        )}
      </ViewPoolDetailsModal>
    )
}
