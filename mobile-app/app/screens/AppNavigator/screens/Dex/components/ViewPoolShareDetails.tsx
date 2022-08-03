import { View } from 'react-native'
import { memo } from 'react'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WalletToken } from '@store/wallet'
import { PortfolioButtonGroupTabKey } from '@screens/AppNavigator/screens/Portfolio/components/TotalPortfolio'
import { useDenominationCurrency } from '@screens/AppNavigator/screens/Portfolio/hooks/PortfolioCurrency'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { ViewPoolAmountRow } from './ViewPoolAmountRow'
import { translate } from '@translations'

interface ViewPoolContentsDetailsProps {
  tokenA: string
  tokenB: string
  pairData: PoolPairData
  poolInfo: WalletToken
  totalPooledTokenA: string
  totalPooledTokenB: string
}

export const ViewPoolShareDetails = ({
    tokenA,
    tokenB,
    pairData,
    poolInfo,
    totalPooledTokenA,
    totalPooledTokenB
  }: ViewPoolContentsDetailsProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const TokenIconA = getNativeIcon(tokenA)
  const TokenIconB = getNativeIcon(tokenB)

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
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-100')}
      dark={tailwind('bg-mono-dark-v2-100')}
      style={tailwind('px-5 h-full')}
    >
      <View style={tailwind('flex-row mb-3')}>
        <View>
          <TokenIconA style={tailwind('absolute z-50')} width={32} height={32} />
          <TokenIconB style={tailwind('ml-5 z-40')} width={32} height={32} />
        </View>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          style={tailwind('pl-1 text-2xl font-semibold')}
        >
          {`${tokenA}-${tokenB}`}
        </ThemedTextV2>
      </View>

      <View style={tailwind('mt-5')}>
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
            testID='Pool_share_amount_percentage'
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
      </View>
    </ThemedViewV2>
  )
})
