import { View } from '@components'
import { NumberRowV2 } from '@components/NumberRowV2'
import { ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { DexItem, poolPairSelector } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useLayoutEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'
import { FavoriteButton } from './components/FavoriteButton'
import { PoolPairIconV2 } from './components/PoolPairCards/PoolPairIconV2'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'PoolPairDetailsScreen'>

export function PoolPairDetailsScreen ({ route }: Props): JSX.Element {
  const { id } = route.params
  const poolPair = useSelector((state: RootState) => poolPairSelector(state.wallet, id))
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  useLayoutEffect(() => {
    if (poolPair === undefined) {
      return
    }

    navigation.setOptions({
      headerTitle: translate('screens/PoolPairDetailsScreen', '{{poolPair}} Pool', { poolPair: poolPair.data.displaySymbol })
    })
  }, [navigation])

  if (poolPair === undefined) {
    return <></>
  }

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('px-5 py-8')}
    >
      <Header
        symbolA={poolPair.data.tokenA.displaySymbol}
        symbolB={poolPair.data.tokenB.displaySymbol}
        poolPairSymbol={poolPair.data.displaySymbol}
        poolPairName={poolPair.data.name}
        pairId={id}
      />
      <PoolPairDetail poolPair={poolPair} />
      <PriceRateDetail poolPair={poolPair} />
      <APRDetail total={poolPair.data.apr?.total ?? 0} reward={poolPair.data.apr?.reward ?? 0} commission={poolPair.data.apr?.commission ?? 0} />
    </ThemedScrollViewV2>
  )
}

export function Header (props: {
  symbolA: string
  symbolB: string
  poolPairSymbol: string
  poolPairName: string
  pairId: string
}): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind('flex flex-row items-center pb-5 mb-5 border-b-0.5')}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
    >
      <PoolPairIconV2
        symbolA={props.symbolA}
        symbolB={props.symbolB}
      />
      <View style={tailwind('flex-col ml-3 flex-auto pr-3')}>
        <ThemedTextV2
          style={tailwind('font-semibold-v2')}
        >
          {props.poolPairSymbol}
        </ThemedTextV2>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => { }}
          testID='token_detail_explorer_url'
        >
          <View style={tailwind('flex-row')}>
            <ThemedTextV2
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              style={tailwind('text-sm font-normal-v2')}
            >
              {`${props.poolPairName} `}
              <ThemedIcon
                light={tailwind('text-mono-light-v2-700')}
                dark={tailwind('text-mono-dark-v2-700')}
                iconType='Feather'
                name='external-link'
                size={16}
              />
            </ThemedTextV2>
          </View>
        </TouchableOpacity>
      </View>
      <View style={tailwind('w-5')}>
        <FavoriteButton
          pairId={props.pairId}
          notFavouriteBgColor={{
            light: 'bg-mono-light-v2-200',
            dark: 'bg-mono-dark-v2-200'
          }}
        />
      </View>
    </ThemedViewV2>
  )
}

function PoolPairDetail ({ poolPair }: { poolPair: DexItem }): JSX.Element {
  const { getTokenPrice } = useTokenPrice()

  return (
    <ThemedViewV2
      style={tailwind('border-b-0.5 mb-5')}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
    >
      <NumberRowV2
        containerStyle={{ style: tailwind('flex-row items-start w-full bg-transparent mb-5') }}
        lhs={{
          value: translate('screens/PoolPairDetailsScreen', 'Volume (24H)'),
          testID: '24h_volume'
        }}
        rhs={{
          value: new BigNumber(poolPair.data.volume?.h24 ?? 0).toFixed(2),
          prefix: '$',
          testID: '24h_volume_value'
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate('screens/PoolPairDetailsScreen', 'Total liquidity'),
          testID: 'total_liquidity'
        }}
        rhs={{
          value: new BigNumber(poolPair.data.totalLiquidity.token).toFixed(8),
          usdAmount: new BigNumber(poolPair.data.totalLiquidity.usd ?? getTokenPrice(poolPair.data.symbol, new BigNumber(poolPair.data.totalLiquidity.token), true)),
          usdTextStyle: tailwind('text-sm'),
          usdContainerStyle: tailwind('pt-1'),
          testID: 'total_liquidity_value'
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate('screens/PoolPairDetailsScreen', 'Pooled {{tokenA}}', { tokenA: poolPair.data.tokenA.displaySymbol }),
          testID: 'pooled_tokenA'
        }}
        rhs={{
          value: new BigNumber(poolPair.data.tokenA.reserve).toFixed(8),
          suffix: ` ${poolPair.data.tokenA.displaySymbol}`,
          usdAmount: getTokenPrice(poolPair.data.tokenA.symbol, new BigNumber(poolPair.data.tokenA.reserve)),
          usdTextStyle: tailwind('text-sm'),
          usdContainerStyle: tailwind('pt-1'),
          testID: 'pooled_tokenA_value'
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate('screens/PoolPairDetailsScreen', 'Pooled {{tokenB}}', { tokenB: poolPair.data.tokenB.displaySymbol }),
          testID: 'pooled_tokenB'
        }}
        rhs={{
          value: new BigNumber(poolPair.data.tokenB.reserve).toFixed(8),
          suffix: ` ${poolPair.data.tokenB.displaySymbol}`,
          usdAmount: getTokenPrice(poolPair.data.tokenB.symbol, new BigNumber(poolPair.data.tokenB.reserve)),
          usdTextStyle: tailwind('text-sm'),
          usdContainerStyle: tailwind('pt-1'),
          testID: 'pooled_tokenB_value'
        }}
      />
    </ThemedViewV2>
  )
}

function PriceRateDetail ({ poolPair }: { poolPair: DexItem }): JSX.Element {
  const { getTokenPrice } = useTokenPrice()

  return (
    <ThemedViewV2
      style={tailwind('border-b-0.5 mb-5')}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
    >
      <NumberRowV2
        lhs={{
          value: translate('screens/PoolPairDetailsScreen', '1 {{tokenA}} =', { tokenA: poolPair.data.tokenA.displaySymbol }),
          testID: 'price_rate_tokenA'
        }}
        rhs={{
          value: new BigNumber(poolPair.data.priceRatio.ab).toFixed(8),
          suffix: ` ${poolPair.data.tokenA.displaySymbol}`,
          usdAmount: getTokenPrice(poolPair.data.tokenA.symbol, new BigNumber(poolPair.data.priceRatio.ab)),
          usdTextStyle: tailwind('text-sm'),
          usdContainerStyle: tailwind('pt-1'),
          testID: 'price_rate_tokenA_value'
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate('screens/PoolPairDetailsScreen', '1 {{tokenB}} =', { tokenB: poolPair.data.tokenB.displaySymbol }),
          testID: 'price_rate_tokenB'
        }}
        rhs={{
          value: new BigNumber(poolPair.data.priceRatio.ba).toFixed(8),
          suffix: ` ${poolPair.data.tokenB.displaySymbol}`,
          usdAmount: getTokenPrice(poolPair.data.tokenB.symbol, new BigNumber(poolPair.data.priceRatio.ba)),
          usdTextStyle: tailwind('text-sm'),
          usdContainerStyle: tailwind('pt-1'),
          testID: 'price_rate_tokenB_value'
        }}
      />
    </ThemedViewV2>
  )
}

function APRDetail (props: { total: number, reward: number, commission: number }): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind('border-b-0.5 pb-5 flex-row')}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
    >
      <View style={tailwind('w-5/12 flex flex-row items-start')}>
        <ThemedTextV2>
          {translate('screens/PoolPairDetailsScreen', 'APR')}
        </ThemedTextV2>
      </View>
      <View style={tailwind('flex-1 flex-col items-end')}>
        <NumberFormat
          displayType='text'
          suffix='%'
          renderText={(val: string) => (
            <ThemedTextV2
              style={tailwind('text-right font-semibold-v2 mt-1')}
              light={tailwind('text-green-v2')}
              dark={tailwind('text-green-v2')}
              testID='apr_total_value'
            >
              {val}
            </ThemedTextV2>
          )}
          thousandSeparator
          value={new BigNumber(props.total).multipliedBy(100).toFixed(2)}
        />
        <NumberFormat
          displayType='text'
          renderText={(val: string) => (
            <ThemedTextV2
              style={tailwind('text-right text-xs font-normal-v2 mt-1')}
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              testID='apr_reward_value'
            >
              {`${val}% ${translate('screens/PoolPairDetailsScreen', 'in rewards')}`}
            </ThemedTextV2>
          )}
          thousandSeparator
          value={new BigNumber(props.reward).multipliedBy(100).toFixed(2)}
        />
        <NumberFormat
          displayType='text'
          renderText={(val: string) => (
            <ThemedTextV2
              style={tailwind('text-right text-xs font-normal-v2 mt-1')}
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              testID='apr_commission_value'
            >
              {`${val}% ${translate('screens/PoolPairDetailsScreen', 'in commissions')}`}
            </ThemedTextV2>
          )}
          thousandSeparator
          value={new BigNumber(props.commission).multipliedBy(100).toFixed(2)}
        />
      </View>
    </ThemedViewV2>
  )
}
