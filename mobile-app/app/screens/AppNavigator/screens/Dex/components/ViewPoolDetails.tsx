import { View } from 'react-native'
import { memo } from 'react'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WalletToken } from '@store/wallet'
import { useDenominationCurrency } from '@screens/AppNavigator/screens/Portfolio/hooks/PortfolioCurrency'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { ViewPoolAmountRow } from './ViewPoolAmountRow'
import { translate } from '@translations'
import { PoolPairTextSectionV2 } from './PoolPairCards/PoolPairTextSectionV2'
import { getPrecisedCurrencyValue, getPrecisedTokenValue } from '../../Auctions/helpers/precision-token-value'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { NumberRowV2 } from '@components/NumberRowV2'
interface ViewPoolDetailsProps {
  dataRoutes: 'add' | 'remove'
  pairData: PoolPairData
  pairInfo: WalletToken
}

export const ViewPoolDetails = ({
  dataRoutes,
  pairData,
  pairInfo
}: ViewPoolDetailsProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-100')}
      dark={tailwind('bg-mono-dark-v2-100')}
      style={tailwind('px-5 h-full')}
    >
      <View style={tailwind('flex-row mb-3')}>
        <View>
          <PoolPairTextSectionV2
            symbolA={pairData.tokenA.displaySymbol}
            symbolB={pairData.tokenB.displaySymbol}
            customSize={32}
          />
        </View>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          style={tailwind('pl-1 text-xl font-semibold-v2')}
        >
          {pairInfo.displaySymbol}
        </ThemedTextV2>
      </View>

      {dataRoutes === 'add'
        ? (
          <AddLiquidityDetails
            pairData={pairData}
            pairInfo={pairInfo}
          />
        )
        : (
          <RemoveLiquidityDetails
            pairData={pairData}
            pairInfo={pairInfo}
          />
        )}
    </ThemedViewV2>
  )
})

interface AddLiquidityDetailsProps {
  pairData: PoolPairData
  pairInfo: WalletToken
}

function AddLiquidityDetails ({ pairInfo, pairData }: AddLiquidityDetailsProps): JSX.Element {
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet)
  const poolPairData = pairs.find(
    (pr) => pr.data.symbol === (pairInfo as AddressToken).symbol
  )
  const mappedPair = poolPairData?.data
  const { denominationCurrency } = useDenominationCurrency()
  const { getTokenPrice } = useTokenPrice()
  const getUSDValue = (
    amount: BigNumber,
    symbol: string,
    isLPs: boolean = false
  ): BigNumber => {
    return getTokenPrice(symbol, amount, isLPs)
  }

  const volume24H = pairData?.volume?.h24 ?? 0

  return (
    <ThemedViewV2 style={tailwind('mt-5')}>
      <View style={tailwind('mb-4')}>
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', 'Volume (24H)'),
            testID: 'shares_to_add',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: getPrecisedCurrencyValue(volume24H),
            testID: `volume_24h_${pairInfo.displaySymbol}`,
            usdTextStyle: tailwind('text-sm'),
            prefix: '$'
          }}
          testID={`${pairInfo.displaySymbol}_pool_share_amount`}
        />
      </View>
      <View style={tailwind('mb-4')}>
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', 'Total liquidity'),
            testID: 'shares_to_add',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: getPrecisedTokenValue(pairData.totalLiquidity.usd ?? new BigNumber(0)),
            testID: `total_liquidity_${pairInfo.displaySymbol}_amount`,
            usdTextStyle: tailwind('text-sm'),
            prefix: '$'
          }}
          testID={`total_liquidity_${pairInfo.displaySymbol}`}
        />
      </View>
      <NumberRowV2
        lhs={{
          value: translate('screens/RemoveLiquidity', 'Tokens in {{token}}', {
            token: pairData.tokenA.displaySymbol
          }),
          themedProps: {
            light: tailwind('text-mono-light-v2-500'),
            dark: tailwind('text-mono-dark-v2-500')
          },
          testID: 'shares_to_add'
        }}
        rhs={{
          value: mappedPair?.tokenA.reserve ?? 0,
          testID: `Pooled_${pairData.tokenA.displaySymbol}_${denominationCurrency}`,
          usdTextStyle: tailwind('text-sm'),
          usdAmount: getUSDValue(
            new BigNumber(pairData.tokenA.reserve),
            pairData.tokenB.symbol
          )
        }}
        testID={`${pairInfo.displaySymbol}_pool_share_amount`}
      />
      <NumberRowV2
        lhs={{
          value: translate('screens/RemoveLiquidity', 'Tokens in {{token}}', {
            token: pairData.tokenB.displaySymbol
          }),
          testID: `Pooled_${pairData.tokenB.displaySymbol}`,
          themedProps: {
            light: tailwind('text-mono-light-v2-500'),
            dark: tailwind('text-mono-dark-v2-500')
          }
        }}
        rhs={{
          value: mappedPair?.tokenB.reserve ?? 0,
          testID: `Pooled_${pairData.tokenB.displaySymbol}_${denominationCurrency}`,
          usdTextStyle: tailwind('text-sm'),
          usdAmount: getUSDValue(
            new BigNumber(pairData.tokenB.reserve),
            pairData.tokenB.symbol
          )
        }}
        testID={`${pairInfo.displaySymbol}_pool_share_amount`}
      />

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
          testID={`${pairInfo.displaySymbol}_Apr`}
        />
      )}
    </ThemedViewV2>
  )
}

interface RemoveLiquidityDetailsProps {
  pairData: PoolPairData
  pairInfo: WalletToken
}

function RemoveLiquidityDetails ({ pairInfo, pairData }: RemoveLiquidityDetailsProps): JSX.Element {
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet)
  const poolPairData = pairs.find(
    (pr) => pr.data.symbol === (pairInfo as AddressToken).symbol
  )
  const mappedPair = poolPairData?.data
  const toRemove = new BigNumber(1)
    .times((pairInfo).amount)
    .decimalPlaces(8, BigNumber.ROUND_DOWN)
  const ratioToTotal = toRemove.div(mappedPair?.totalLiquidity?.token ?? 1)
  const tokenATotal = ratioToTotal
    .times(mappedPair?.tokenA.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN)
  const tokenBTotal = ratioToTotal
    .times(mappedPair?.tokenB.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN)
  const lpPercentage = Number(pairInfo.amount) / Number(pairData.totalLiquidity.token)

  const { getTokenPrice } = useTokenPrice()
  const getUSDValue = (
    amount: BigNumber,
    symbol: string,
    isLPs: boolean = false
  ): BigNumber => {
    return getTokenPrice(symbol, amount, isLPs)
  }

  return (
    <ThemedViewV2 style={tailwind('mt-5')}>
      <View style={tailwind('mb-5')}>
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', 'Your LP Tokens'),
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            },
            testID: 'lp_tokens_title'
          }}
          rhs={{
            value: pairInfo.amount,
            themedProps: {
              light: tailwind('text-mono-light-v2-800'),
              dark: tailwind('text-mono-dark-v2-800')
            },
            testID: `lp_${pairData.tokenA.displaySymbol}_tokens_value`
          }}
          testID={`${pairInfo.displaySymbol}_lp_tokens`}
        />
        <ViewPoolAmountRow // TODO: Change to NumberRowV2
          amount={new BigNumber(lpPercentage).toFixed(2)}
          valueThemeProps={{
            dark: tailwind('text-mono-dark-v2-500'),
            light: tailwind('text-mono-light-v2-500')
          }}
          prefix='('
          suffix='%)'
          testID={`lp_${pairData.tokenA.displaySymbol}_tokens_percentage_amount`}
        />
      </View>
      <NumberRowV2
        lhs={{
          value: translate('screens/RemoveLiquidity', 'Tokens in {{token}}', {
            token: pairData.tokenA.displaySymbol
          }),
          themedProps: {
            light: tailwind('text-mono-light-v2-500'),
            dark: tailwind('text-mono-dark-v2-500')
          },
          testID: `token_in_${pairData.tokenA.displaySymbol}_title`
        }}
        rhs={{
          value: tokenATotal.toFixed(8),
          themedProps: {
            light: tailwind('text-mono-light-v2-800'),
            dark: tailwind('text-mono-dark-v2-800')
          },
          usdAmount: getUSDValue(
            new BigNumber(tokenATotal),
            pairData.tokenA.symbol
          ),
          usdTextStyle: tailwind('text-sm'),
          testID: `token_in_${pairData.tokenA.displaySymbol}_value`
        }}
        testID={`token_in_${pairData.tokenA.displaySymbol}`}
      />

      <NumberRowV2
        lhs={{
          value: translate('screens/RemoveLiquidity', 'Tokens in {{token}}', {
          token: pairData.tokenB.displaySymbol
          }),
          themedProps: {
            light: tailwind('text-mono-light-v2-500'),
            dark: tailwind('text-mono-dark-v2-500')
          },
          testID: `token_in_${pairData.tokenB.displaySymbol}_title`
        }}
        rhs={{
          value: tokenBTotal.toFixed(8),
          themedProps: {
            light: tailwind('text-mono-light-v2-800'),
            dark: tailwind('text-mono-dark-v2-800')
          },
          usdAmount: getUSDValue(
            new BigNumber(tokenBTotal),
            pairData.tokenB.symbol
          ),
          usdTextStyle: tailwind('text-sm'),
          testID: `token_in_${pairData.tokenB.displaySymbol}_value`
        }}
        testID={`token_in_${pairData.tokenB.displaySymbol}`}
      />
      {pairData?.apr?.total !== undefined && pairData?.apr?.total !== null && (
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', 'APR'),
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            },
            testID: `${pairInfo.displaySymbol}_apr_tite`
          }}
          rhs={{
            value: new BigNumber(isNaN(pairData.apr.total) ? 0 : pairData.apr.total).times(100).toFixed(2),
            themedProps: {
              light: tailwind('text-darksuccess-500 font-semibold-v2'),
              dark: tailwind('text-success-500 font-semibold-v2')
            },
            testID: `${pairInfo.displaySymbol}_apr_value`
          }}
          testID={`${pairInfo.displaySymbol}_apr`}
        />
      )}
    </ThemedViewV2>
  )
}
