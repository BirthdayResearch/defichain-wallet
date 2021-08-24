import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { SectionList, TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { View } from '../../../../components'
import { getNativeIcon } from '../../../../components/icons/assets'
import { SectionTitle } from '../../../../components/SectionTitle'
import { ThemedIcon, ThemedText, ThemedView } from '../../../../components/themed'
import { usePoolPairsAPI } from '../../../../hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'
import { DexSkeletonLoader } from './screens/DexSkeletonLoader'

enum SectionKey {
  YourLiquidity = 'YOUR LIQUIDITY',
  AvailablePoolPair = 'AVAILABLE POOL PAIR'
}
export function DexScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const tokens = useTokensAPI()
  const pairs = usePoolPairsAPI()
  const yourLPTokens = useSelector(() => tokens.filter(({ isLPS }) => isLPS).map(data => ({
    type: 'your',
    data: data
  })))

  const onAdd = (data: PoolPairData): void => {
    navigation.navigate({ name: 'AddLiquidity', params: { pair: data }, merge: true })
  }

  const onRemove = (data: PoolPairData): void => {
    navigation.navigate({ name: 'RemoveLiquidity', params: { pair: data }, merge: true })
  }

  const isEmpty = (data: any[]): boolean => {
    return data.length === 0
  }

  return (
    <SectionList
      testID='liquidity_screen_list'
      style={tailwind('bg-gray-100')}
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
      renderItem={({ item }): JSX.Element => {
        const poolPairData = pairs.find(pr => pr.data.symbol === (item.data as AddressToken).symbol)
        switch (item.type) {
          case 'your':
            return PoolPairRowYour(item.data, () => {
              onAdd((poolPairData as DexItem<PoolPairData>).data)
            }, () => {
              onRemove((poolPairData as DexItem<PoolPairData>).data)
            }, poolPairData?.data)
          case 'available':
            return PoolPairRowAvailable(item.data,
              () => onAdd(item.data),
              () => navigation.navigate({ name: 'PoolSwap', params: { poolpair: item.data }, merge: true })
            )
        }
      }}
      renderSectionHeader={({ section }) => {
        switch (section.key) {
          case SectionKey.YourLiquidity:
            if (!isEmpty(section.data)) {
              return (
                <SectionTitle text={translate('screens/DexScreen', section.key)} testID='liq_title' />
              )
            }
            return (
              <ThemedView style={tailwind('px-4 pt-4 pb-2')} light='bg-gray-100' dark='bg-dark'>
                <ThemedText style={tailwind('text-base font-medium')}>
                  {
                    translate('screens/DexScreen', 'Pick a pool pair below, supply liquidity to power the Decentralized Exchange (DEX), and start earning fees and annual returns of up to 100%. Withdraw at any time.')
                  }
                </ThemedText>
              </ThemedView>
            )

          case SectionKey.AvailablePoolPair:
            return (
              <>
                <SectionTitle text={translate('screens/DexScreen', section.key)} testID={section.key} />
                {isEmpty(section.data) && <DefaultSkeletonLoader />}
              </>
            )
        }
      }}
      keyExtractor={(item, index) => `${index}`}
    />
  )
}

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

function PoolPairRowYour (data: AddressToken, onAdd: () => void, onRemove: () => void, pair?: PoolPairData): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getNativeIcon(symbolA)
  const IconB = getNativeIcon(symbolB)
  const toRemove = new BigNumber(1).times(data.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
  const ratioToTotal = toRemove.div(pair?.totalLiquidity?.token ?? 1)
  // assume defid will trim the dust values too
  const tokenATotal = ratioToTotal.times(pair?.tokenA.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)
  const tokenBTotal = ratioToTotal.times(pair?.tokenB.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)

  return (
    <ThemedView
      testID='pool_pair_row_your' style={tailwind('p-4')} light='bg-white border-b border-gray-200'
      dark='bg-darksurface border-b border-dark'
    >
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <ThemedText style={tailwind('text-lg font-bold')}>{data.symbol}</ThemedText>
        </View>
        <View style={tailwind('flex-row -mr-3')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} />
          <PoolPairLiqBtn name='remove' onPress={onRemove} pair={data.symbol} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        <PoolPairInfoLine
          symbol={data.symbol} reserve={data.amount} row='your' decimalScale={8}
        />
        {
          pair !== undefined && (
            <>
              <PoolPairInfoLine
                symbol={symbolA} reserve={tokenATotal.toFixed(8)} row='tokenA' decimalScale={8}
              />
              <PoolPairInfoLine
                symbol={symbolB} reserve={tokenBTotal.toFixed(8)} row='tokenB' decimalScale={8}
              />
            </>
          )
        }
      </View>
    </ThemedView>
  )
}

function PoolPairRowAvailable (data: PoolPairData, onAdd: () => void, onSwap: () => void): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getNativeIcon(symbolA)
  const IconB = getNativeIcon(symbolB)

  return (
    <ThemedView
      testID='pool_pair_row' style={tailwind('p-4')} light='bg-white border-b border-gray-200'
      dark='bg-darksurface border-b border-dark'
    >
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <ThemedText
            testID={`your_symbol_${symbolA}-${symbolB}`}
            style={tailwind('text-lg font-bold')}
          >{data.symbol}
          </ThemedText>
        </View>

        <View style={tailwind('flex-row -mr-2')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} />
          <PoolPairLiqBtn name='swap-horiz' onPress={onSwap} pair={data.symbol} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        {
          data.apr?.total !== undefined &&
            <PoolPairAPR symbol={`${symbolA}-${symbolB}`} apr={data.apr.total} row='apr' />
        }
        <PoolPairInfoLine
          symbol={symbolA} reserve={data.tokenA.reserve} row='available' decimalScale={2}
        />
        <PoolPairInfoLine
          symbol={symbolB} reserve={data.tokenB.reserve} row='available' decimalScale={2}
        />
      </View>
    </ThemedView>
  )
}

function PoolPairLiqBtn (props: { name: React.ComponentProps<typeof MaterialIcons>['name'], pair: string, onPress?: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID={`pool_pair_${props.name}_${props.pair}`}
      style={tailwind('p-1 border border-gray-300 rounded mr-2')}
      onPress={props.onPress}
    >
      <ThemedIcon
        iconType='MaterialIcons' size={24} name={props.name} light='text-primary-500'
        dark='text-darkprimary'
      />
    </TouchableOpacity>
  )
}

function PoolPairInfoLine (props: { symbol: string, reserve: string, row: string, decimalScale: number }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between')}>
      <ThemedText style={tailwind('text-sm font-medium mb-1')}>Pooled {props.symbol}</ThemedText>
      <NumberFormat
        suffix={` ${props.symbol}`}
        value={props.reserve} decimalScale={props.decimalScale} thousandSeparator displayType='text'
        renderText={value => {
          return (
            <ThemedText
              testID={`${props.row}_${props.symbol}`}
              style={tailwind('text-sm')}
            >{value}
            </ThemedText>
          )
        }}
      />
    </View>
  )
}

function PoolPairAPR (props: { symbol: string, apr: number, row: string }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between items-end')}>
      <ThemedText
        style={tailwind('text-sm font-medium mb-1')}
      >{translate('screens/DexScreen', 'APR')}
      </ThemedText>
      <NumberFormat
        suffix='%'
        value={new BigNumber(isNaN(props.apr) ? 0 : props.apr).times(100).toFixed(2)} decimalScale={2} thousandSeparator
        displayType='text'
        renderText={value => {
          return (
            <ThemedText
              testID={`${props.row}_${props.symbol}`}
              style={tailwind('text-xl')}
            >{value}
            </ThemedText>
          )
        }}
      />
    </View>
  )
}

function DefaultSkeletonLoader (): JSX.Element {
  const skeletonRow = [1, 2, 3]
  return (
    <>
      {skeletonRow.map((x) => (
        <DexSkeletonLoader key={x} />
      ))}
    </>
  )
}
