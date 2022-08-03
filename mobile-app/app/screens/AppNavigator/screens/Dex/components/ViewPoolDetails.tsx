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

interface ViewPoolDetailsProps {
  dataRoutes: 'add' | 'remove'
  pairData: PoolPairData
  poolInfo: WalletToken
  totalPooledTokenA: string
  totalPooledTokenB: string
}

export const ViewPoolDetails = ({
    dataRoutes,
    pairData,
    poolInfo,
    totalPooledTokenA,
    totalPooledTokenB
  }: ViewPoolDetailsProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const TokenIconA = getNativeIcon(pairData.tokenA.displaySymbol)
  const TokenIconB = getNativeIcon(pairData.tokenB.displaySymbol)

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
          style={tailwind('pl-1 text-xl font-semibold-v2')}
        >
          {poolInfo.displaySymbol}
        </ThemedTextV2>
      </View>

      {dataRoutes === 'add'
        ? (
          <AddLiquidityDetails
            pairData={pairData}
            poolInfo={poolInfo}
            totalPooledTokenA={totalPooledTokenA}
            totalPooledTokenB={totalPooledTokenB}
          />
          )
          : (
            <RemoveLiquidityDetails
              pairData={pairData}
              poolInfo={poolInfo}
              totalPooledTokenA={totalPooledTokenA}
              totalPooledTokenB={totalPooledTokenB}
            />
       )}
    </ThemedViewV2>
  )
})

// Update this for the add liquidity details
interface AddLiquidityDetailsProps {
  pairData: PoolPairData
  poolInfo: WalletToken
  totalPooledTokenA: string
  totalPooledTokenB: string
}

function AddLiquidityDetails ({ poolInfo, pairData, totalPooledTokenA, totalPooledTokenB }: AddLiquidityDetailsProps): JSX.Element {
  // const { denominationCurrency } = useDenominationCurrency()
  // const { getTokenPrice } = useTokenPrice()
  // const getUSDValue = (
  //   amount: BigNumber,
  //   symbol: string,
  //   isLPs: boolean = false
  // ): BigNumber => {
  //   return getTokenPrice(symbol, amount, isLPs)
  // }
  return (
    <View style={tailwind('mt-5')}>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('pl-1 text-2xl font-semibold-v2')}
      >
        Add liquidity
      </ThemedTextV2>
    </View>
  )
}

interface RemoveLiquidityDetailsProps {
  pairData: PoolPairData
  poolInfo: WalletToken
  totalPooledTokenA: string
  totalPooledTokenB: string
}

function RemoveLiquidityDetails ({ poolInfo, pairData, totalPooledTokenA, totalPooledTokenB }: RemoveLiquidityDetailsProps): JSX.Element {
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
          testID={`${poolInfo.displaySymbol}_pool_share_amount`}
        />
        <ViewPoolAmountRow
          amount='3.123'
          valueThemeProps={{
            dark: tailwind('text-mono-dark-v2-700'),
            light: tailwind('text-mono-light-v2-700')
          }}
          prefix='('
          suffix='%)'
          testID={`${poolInfo.displaySymbol}_pool_share_amount_percentage`}
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
          testID={`Pooled_${pairData.tokenA.displaySymbol}`}
        />
        <ViewPoolAmountRow
          amount={getUSDValue(new BigNumber(totalPooledTokenA), pairData.tokenA.symbol).toFixed(2)}
          valueThemeProps={{
            dark: tailwind('text-mono-dark-v2-700'),
            light: tailwind('text-mono-light-v2-700')
          }}
          prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
          suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
          testID={`Pooled_${pairData.tokenA.displaySymbol}_${denominationCurrency}`}
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
          testID={`Pooled_${pairData.tokenB.displaySymbol}`}
        />
        <ViewPoolAmountRow
          amount={getUSDValue(new BigNumber(totalPooledTokenB), pairData.tokenB.symbol).toFixed(2)}
          valueThemeProps={{
            dark: tailwind('text-mono-dark-v2-700'),
            light: tailwind('text-mono-light-v2-700')
          }}
          prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
          suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
          testID={`Pooled_${pairData.tokenB.displaySymbol}_${denominationCurrency}`}
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
          testID={`${poolInfo.displaySymbol}_Apr`}
        />
      )}
    </View>
  )
}
