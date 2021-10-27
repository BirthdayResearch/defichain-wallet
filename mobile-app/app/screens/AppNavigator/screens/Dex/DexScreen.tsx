import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { View } from '@components'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { ThemedSectionList, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { usePoolPairsAPI } from '@hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DisplayDexGuidelinesPersistence, Logging } from '@api'
import { DexGuidelines } from './DexGuidelines'

enum SectionKey {
  YourLiquidity = 'YOUR LIQUIDITY',
  AvailablePoolPair = 'AVAILABLE POOL PAIRS'
}

export function DexScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [displayGuidelines, setDisplayGuidelines] = useState<boolean>(true)
  const tokens = useTokensAPI()
  const pairs = usePoolPairsAPI()
  const yourLPTokens = useSelector(() => tokens.filter(({ isLPS }) => isLPS).map(data => ({
    type: 'your',
    data: data
  })))

  const onAdd = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'AddLiquidity',
      params: { pair: data },
      merge: true
    })
  }

  const onRemove = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'RemoveLiquidity',
      params: { pair: data },
      merge: true
    })
  }

  const isEmpty = (data: any[]): boolean => {
    return data.length === 0
  }

  useEffect(() => {
    DisplayDexGuidelinesPersistence.get()
      .then((shouldDisplayGuidelines: boolean) => {
        setDisplayGuidelines(shouldDisplayGuidelines)
      })
      .catch((err) => Logging.error(err))
      .finally(() => setIsLoaded(true))
  }, [])

  const onGuidelinesClose = async (): Promise<void> => {
    await DisplayDexGuidelinesPersistence.set(false)
    setDisplayGuidelines(false)
  }

  if (!isLoaded) {
    return <></>
  }

  if (displayGuidelines) {
    return <DexGuidelines onClose={onGuidelinesClose} />
  }

  return (
    <ThemedSectionList
      keyExtractor={(item, index) => `${index}`}
      renderItem={({ item }): JSX.Element => {
        const poolPairData = pairs.find(pr => pr.data.symbol === (item.data as AddressToken).symbol)
        switch (item.type) {
          case 'your':
            if (poolPairData?.data != null) {
              return (
                <PoolPairRowYour
                  data={item.data}
                  onAdd={() => onAdd((poolPairData as DexItem<PoolPairData>)?.data)}
                  onRemove={() => onRemove((poolPairData as DexItem<PoolPairData>)?.data)}
                  pair={poolPairData?.data}
                />
              )
            }
            return (
              <SkeletonLoader
                row={1}
                screen={SkeletonLoaderScreen.Dex}
              />
            )
          case 'available':
            return (
              <PoolPairRowAvailable
                data={item.data}
                onAdd={() => onAdd(item.data)}
                onSwap={() => navigation.navigate({
                  name: 'PoolSwap',
                  params: { pair: item.data },
                  merge: true
                })}
              />
            )
          default:
            return <></>
        }
      }}
      renderSectionHeader={({ section }) => {
        switch (section.key) {
          case SectionKey.YourLiquidity:
            if (!isEmpty(section.data)) {
              return (
                <ThemedSectionTitle
                  testID='liq_title'
                  text={translate('screens/DexScreen', section.key)}
                />
              )
            }
            return <></>
          case SectionKey.AvailablePoolPair:
            return (
              <>
                <ThemedSectionTitle
                  testID={section.key}
                  text={translate('screens/DexScreen', section.key)}
                />

                {isEmpty(section.data) && (
                  <SkeletonLoader
                    row={3}
                    screen={SkeletonLoaderScreen.Dex}
                  />
                )}
              </>
            )
          default:
            return <></>
        }
      }}
      sections={[
        {
          key: SectionKey.YourLiquidity,
          data: yourLPTokens as Array<DexItem<any>>
        },
        {
          key: SectionKey.AvailablePoolPair,
          data: pairs
        }
      ]}
      testID='liquidity_screen_list'
    />
  )
}

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

function PoolPairRowYour ({
  data,
  onAdd,
  onRemove,
  pair
}: { data: AddressToken, onAdd: () => void, onRemove: () => void, pair?: PoolPairData }): JSX.Element {
  const [symbolA, symbolB] = (pair?.tokenA != null && pair?.tokenB != null)
    ? [pair.tokenA.displaySymbol, pair.tokenB.displaySymbol]
    : data.symbol.split('-')
  const toRemove = new BigNumber(1).times(data.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
  const ratioToTotal = toRemove.div(pair?.totalLiquidity?.token ?? 1)
  const symbol = `${symbolA}-${symbolB}`

  // assume defid will trim the dust values too
  const tokenATotal = ratioToTotal.times(pair?.tokenA.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)
  const tokenBTotal = ratioToTotal.times(pair?.tokenB.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 pb-0')}
      testID='pool_pair_row_your'
    >
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
          <ThemedText style={tailwind('text-lg font-bold')}>
            {symbol}
          </ThemedText>
        </View>
      </View>

      <View style={tailwind('mt-4 -mb-1')}>
        <PoolPairInfoLine
          decimalScale={8}
          reserve={data.amount}
          row='your'
          symbol={symbol}
          label='Pooled'
        />

        {
          pair !== undefined && (
            <>
              <PoolPairInfoLine
                decimalScale={8}
                reserve={tokenATotal.toFixed(8)}
                row='tokenA'
                symbol={pair?.tokenA?.displaySymbol}
                label='Your pooled'
              />

              <PoolPairInfoLine
                decimalScale={8}
                reserve={tokenBTotal.toFixed(8)}
                row='tokenB'
                symbol={pair?.tokenB?.displaySymbol}
                label='Your pooled'
              />
            </>
          )
        }
      </View>

      <View style={tailwind('flex-row mt-4 flex-wrap -mr-2')}>
        <PoolPairActionButton
          name='add'
          onPress={onAdd}
          pair={symbol}
          label={translate('screens/DexScreen', 'ADD LIQUIDITY')}
        />

        <PoolPairActionButton
          name='remove'
          onPress={onRemove}
          pair={symbol}
          label={translate('screens/DexScreen', 'REMOVE')}
        />
      </View>
    </ThemedView>
  )
}

function PoolPairRowAvailable ({
  data,
  onAdd,
  onSwap
}: { data: PoolPairData, onAdd: () => void, onSwap: () => void }): JSX.Element {
  const [symbolA, symbolB] = (data?.tokenA != null && data?.tokenB != null)
    ? [data.tokenA.displaySymbol, data.tokenB.displaySymbol]
    : data.symbol.split('-')
  const symbol = `${symbolA}-${symbolB}`

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 pb-0')}
      testID='pool_pair_row'
    >
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
          <ThemedText
            style={tailwind('text-base font-bold')}
            testID={`your_symbol_${symbol}`}
          >
            {symbol}
          </ThemedText>
        </View>
        {
            data.apr?.total !== undefined &&
              <PoolPairAPR
                apr={data.apr.total}
                row='apr'
                symbol={symbol}
              />
          }
      </View>

      <View style={tailwind('mt-4 -mb-1')}>
        <PoolPairInfoLine
          decimalScale={2}
          reserve={data?.tokenA.reserve}
          row='available'
          symbol={data?.tokenA.displaySymbol}
          label='Total pooled'
        />

        <PoolPairInfoLine
          decimalScale={2}
          reserve={data?.tokenB.reserve}
          row='available'
          symbol={data?.tokenB.displaySymbol}
          label='Total pooled'
        />
      </View>

      <View style={tailwind('flex-row mt-4 flex-wrap')}>
        <PoolPairActionButton
          name='add'
          onPress={onAdd}
          pair={symbol}
          label={translate('screens/DexScreen', 'ADD LIQUIDITY')}
        />

        <PoolPairActionButton
          name='swap-horiz'
          onPress={onSwap}
          pair={symbol}
          label={translate('screens/DexScreen', 'SWAP TOKENS')}
        />
      </View>
    </ThemedView>
  )
}

function PoolPairActionButton (props: { name: React.ComponentProps<typeof MaterialIcons>['name'], pair: string, onPress: () => void, label: string }): JSX.Element {
  return (
    <IconButton
      iconName={props.name}
      iconSize={16}
      iconType='MaterialIcons'
      onPress={props.onPress}
      style={tailwind('mr-2 mb-4')}
      testID={`pool_pair_${props.name}_${props.pair}`}
      iconLabel={props.label}
    />
  )
}

function PoolPairInfoLine (props: { symbol: string, reserve: string, row: string, decimalScale: number, label: string }): JSX.Element {
  const Icon = getNativeIcon(props.symbol)

  return (
    <View style={tailwind('flex-row justify-between mb-1')}>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-sm font-normal')}
      >
        {translate('screens/DexScreen', `${props.label} {{symbol}}`, { symbol: props.symbol })}
      </ThemedText>

      <View style={tailwind('flex-row items-center')}>
        <NumberFormat
          decimalScale={props.decimalScale}
          displayType='text'
          renderText={value => {
            return (
              <ThemedText
                style={tailwind('text-sm')}
                testID={`${props.row}_${props.symbol}`}
              >
                {value}
              </ThemedText>
            )
          }}
          thousandSeparator
          value={props.reserve}
        />
        <Icon height={16} width={16} style={tailwind('ml-1')} />
      </View>
    </View>
  )
}

function PoolPairAPR (props: { symbol: string, apr: number, row: string }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-gray-100')}
      dark={tailwind('bg-gray-900')}
      style={tailwind('flex-row justify-between items-center px-2 py-1 rounded')}
    >
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs font-medium')}
      >
        {`${translate('screens/DexScreen', 'APR')}: `}
      </ThemedText>

      <NumberFormat
        decimalScale={2}
        displayType='text'
        renderText={value => {
          return (
            <ThemedText
              style={tailwind('font-semibold text-sm')}
              testID={`${props.row}_${props.symbol}`}
            >
              {value}
            </ThemedText>
          )
        }}
        suffix='%'
        thousandSeparator
        value={new BigNumber(isNaN(props.apr) ? 0 : props.apr).times(100).toFixed(2)}
      />
    </ThemedView>
  )
}

function PoolPairIcon (props: { symbolA: string, symbolB: string}): JSX.Element {
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)

  return (
    <>
      <IconA
        height={24}
        width={24}
        style={tailwind('relative z-10 -mt-3')}
      />

      <IconB
        height={24}
        width={24}
        style={tailwind('-ml-3 mt-3 mr-3')}
      />
    </>
  )
}
