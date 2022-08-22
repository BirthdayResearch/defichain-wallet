import { View } from '@components'
import { NumberRowV2 } from '@components/NumberRowV2'
import {
  IconName, IconType,
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableListItem,
  ThemedViewV2
} from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { DexItem, poolPairSelector, tokensSelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useLayoutEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'
import { PoolPairIconV2 } from './components/PoolPairCards/PoolPairIconV2'
import { DexParamList } from './DexNavigator'
import { useFavouritePoolpairs } from '@screens/AppNavigator/screens/Dex/hook/FavouritePoolpairs'
import { FavoriteButton } from '@screens/AppNavigator/screens/Dex/components/FavoriteButton'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import * as React from 'react'
import { ButtonV2 } from '@components/ButtonV2'

type Props = StackScreenProps<DexParamList, 'PoolPairDetailsScreen'>

export function PoolPairDetailsScreen ({ route }: Props): JSX.Element {
  const { id } = route.params
  const poolPair = useSelector((state: RootState) => poolPairSelector(state.wallet, id))
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))

  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const isFavouritePair = isFavouritePoolpair(id)

  const yourLpToken = useSelector(() => {
    const _yourLPToken: WalletToken | undefined = tokens
      .filter(({ isLPS }) => isLPS)
      .find(pair => pair.id === poolPair?.data.id)
    return _yourLPToken
  })

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

  const onAdd = (data: PoolPairData, info: WalletToken): void => {
    navigation.navigate({
      name: 'AddLiquidity',
      params: { pair: data, pairInfo: info },
      merge: true
    })
  }

  const onRemove = (data: PoolPairData, info: WalletToken): void => {
    navigation.navigate({
      name: 'RemoveLiquidity',
      params: { pair: data, pairInfo: info },
      merge: true
    })
  }

  const onSwap = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'CompositeSwap',
      params: { pair: data },
      merge: true
    })
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
        isFavouritePair={isFavouritePair}
        poolPairId={poolPair.data.id}
        setFavouritePair={setFavouritePoolpair}
      />
      <PoolPairDetail poolPair={poolPair} />
      <PriceRateDetail poolPair={poolPair} />
      <APRDetail
        total={poolPair.data.apr?.total ?? 0}
        reward={poolPair.data.apr?.reward ?? 0}
        commission={poolPair.data.apr?.commission ?? 0}
      />
      <PoolPairActionSection
        pair={poolPair}
        walletToken={yourLpToken}
        onAdd={onAdd}
        onRemove={onRemove}
        onSwap={onSwap}
      />
    </ThemedScrollViewV2>
  )
}

function Header (props: {
  symbolA: string
  symbolB: string
  poolPairSymbol: string
  poolPairName: string
  poolPairId: string
  isFavouritePair: boolean
  setFavouritePair: (id: string) => void
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
        iconBStyle={tailwind('-ml-3')}
      />
      <View style={tailwind('flex-col ml-3')}>
        <ThemedTextV2
          style={tailwind('font-semibold-v2 text-xl')}
        >
          {props.poolPairSymbol}
        </ThemedTextV2>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => { }}
          testID='token_detail_explorer_url'
        >
          <View style={[tailwind('flex-row flex-wrap'), { maxWidth: 223 }]}>
            <ThemedTextV2
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              style={tailwind('text-sm font-normal-v2 break-words')}
            >
              {props.poolPairName}
            </ThemedTextV2>
            <View style={tailwind('ml-1')}>
              <ThemedIcon
                light={tailwind('text-mono-light-v2-700')}
                dark={tailwind('text-mono-dark-v2-700')}
                iconType='Feather'
                name='external-link'
                size={16}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ marginLeft: 'auto' }}>
        <FavoriteButton
          themedStyle={{
            dark: tailwind({
              'bg-mono-dark-v2-200': !props.isFavouritePair,
              'bg-brand-v2-500': props.isFavouritePair
            }),
            light: tailwind({
              'bg-mono-light-v2-200': !props.isFavouritePair,
              'bg-brand-v2-500': props.isFavouritePair
            })
          }}
          pairId={props.poolPairId}
          isFavouritePair={props.isFavouritePair}
          setFavouritePoolpair={props.setFavouritePair}
          additionalStyle={tailwind('w-6 h-6')}
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
              dark={tailwind('text-green-v2')}
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
              dark={tailwind('text-green-v2')}
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

interface PoolPairActionSectionProps {
  onAdd: (data: PoolPairData, info: WalletToken) => void
  onRemove: (data: PoolPairData, info: WalletToken) => void
  onSwap: (data: PoolPairData) => void
  pair: DexItem
  walletToken: WalletToken | undefined
}
function PoolPairActionSection ({
  pair,
  walletToken,
  onAdd,
  onRemove,
  onSwap
}: PoolPairActionSectionProps): JSX.Element {
  return (
    <View style={tailwind('flex-1 pt-12 ')}>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-lg-v2 px-5')}
      >
        <PoolPairActionRow
          title={translate('screens/TokenDetailScreen', 'Add liquidity')}
          icon='plus-circle'
          onPress={() => onAdd(pair.data, walletToken ?? pair.data as unknown as WalletToken)}
          isLast={walletToken === undefined}
          testID='poolpair_token_details_add_liquidity'
          iconType='Feather'
        />
        {walletToken !== undefined && (
          <PoolPairActionRow
            title={translate('screens/TokenDetailScreen', 'Remove liquidity')}
            icon='minus-circle'
            onPress={() => onRemove(pair.data, walletToken)}
            testID='poolpair_token_details_remove_liquidity'
            iconType='Feather'
          />
        )}
      </ThemedViewV2>
      <View style={tailwind('pt-4 pb-1')}>
        <ButtonV2
          label={translate('screens/DexScreen', 'Swap')}
          onPress={() => onSwap(pair.data)}
          testID='poolpair_token_details_composite_swap'
        />
      </View>
    </View>
  )
}

interface PoolPairActionRowProps {
  title: string
  icon: IconName
  onPress: () => void
  testID: string
  iconType: IconType
  border?: boolean
  isLast?: boolean
}

function PoolPairActionRow ({
  title,
  icon,
  onPress,
  testID,
  iconType,
  isLast
}: PoolPairActionRowProps): JSX.Element {
  return (
    <ThemedTouchableListItem
      onPress={onPress}
      isLast={isLast}
      testID={testID}
    >
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('font-normal-v2 text-sm')}
      >
        {title}
      </ThemedTextV2>

      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-700')}
        light={tailwind('text-mono-light-v2-700')}
        iconType={iconType}
        name={icon}
        size={16}
      />
    </ThemedTouchableListItem>
  )
}
