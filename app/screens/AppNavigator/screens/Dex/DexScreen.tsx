import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { SectionList, TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Text, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { SectionTitle } from '../../../../components/SectionTitle'
import { usePoolPairsAPI } from '../../../../hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

export function DexScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const tokens = useTokensAPI()
  const pairs = usePoolPairsAPI()
  const yourLPTokens = useSelector(() => tokens.filter(({ isLPS }) => isLPS).map(data => ({
    type: 'your',
    data: data
  })))

  const onAdd = (data: PoolPairData): void => {
    navigation.navigate('AddLiquidity', { pair: data })
  }

  const onRemove = (data: PoolPairData): void => {
    navigation.navigate('RemoveLiquidity', { pair: data })
  }

  return (
    <SectionList
      testID='liquidity_screen_list'
      style={tailwind('bg-gray-100')}
      sections={[
        {
          data: yourLPTokens as Array<DexItem<any>>
        },
        {
          key: 'AVAILABLE POOL PAIRS',
          data: pairs
        }
      ]}
      renderItem={({ item }): JSX.Element => {
        switch (item.type) {
          case 'your':
            return PoolPairRowYour(item.data, () => {
              const poolPairData = pairs.find(pr => pr.data.symbol === (item.data as AddressToken).symbol)
              onAdd((poolPairData as DexItem<PoolPairData>).data)
            }, () => {
              const poolPairData = pairs.find(pr => pr.data.symbol === (item.data as AddressToken).symbol)
              onRemove((poolPairData as DexItem<PoolPairData>).data)
            })
          case 'available':
            return PoolPairRowAvailable(item.data,
              () => onAdd(item.data),
              () => navigation.navigate('PoolSwap', { poolpair: item.data })
            )
        }
      }}
      ListHeaderComponent={() => {
        if (yourLPTokens.length > 0) {
          return (
            <SectionTitle text={translate('screens/DexScreen', 'YOUR LIQUIDITY')} testID='liq_title' />
          )
        }
        return (
          <View style={tailwind('px-4 pt-4 pb-2')}>
            <Text style={tailwind('text-base font-medium')}>
              {
                translate('screens/DexScreen', 'Pick a pool pair below, supply liquidity to power the Decentralized Exchange (DEX), and start earning fees and annual returns of up to 100%. Withdraw at any time.')
              }
            </Text>
          </View>
        )
      }}
      renderSectionHeader={({ section }) => {
        if (section.key === undefined) {
          return null
        }
        return (
          <SectionTitle text={translate('screens/DexScreen', section.key)} testID={section.key} />
        )
      }}
      keyExtractor={(item, index) => `${index}`}
    />
  )
}

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

function PoolPairRowYour (data: AddressToken, onAdd: () => void, onRemove: () => void): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getTokenIcon(symbolA)
  const IconB = getTokenIcon(symbolB)

  return (
    <View testID='pool_pair_row_your' style={tailwind('p-4 bg-white')}>
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <Text style={tailwind('text-lg font-bold')}>{data.symbol}</Text>
        </View>
        <View style={tailwind('flex-row -mr-3')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} />
          <PoolPairLiqBtn name='remove' onPress={onRemove} pair={data.symbol} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        <PoolPairInfoLine symbol={data.symbol} reserve={data.amount} row='your' />
      </View>
    </View>
  )
}

function PoolPairRowAvailable (data: PoolPairData, onAdd: () => void, onSwap: () => void): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getTokenIcon(symbolA)
  const IconB = getTokenIcon(symbolB)

  return (
    <View testID='pool_pair_row' style={tailwind('p-4 bg-white border-b border-gray-200')}>
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <Text style={tailwind('text-lg font-bold')}>{data.symbol}</Text>
        </View>

        <View style={tailwind('flex-row -mr-2')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} />
          <PoolPairLiqBtn name='swap-vert' onPress={onSwap} pair={data.symbol} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        {
          data.apr?.total !== undefined &&
            <PoolPairAPR symbol={`${symbolA}_${symbolB}`} apr={data.apr.total} row='apr' />
        }
        <PoolPairInfoLine symbol={symbolA} reserve={data.tokenA.reserve} row='available' />
        <PoolPairInfoLine symbol={symbolB} reserve={data.tokenB.reserve} row='available' />
      </View>
    </View>
  )
}

function PoolPairLiqBtn (props: { name: React.ComponentProps<typeof MaterialIcons>['name'], pair: string, onPress?: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID={`pool_pair_${props.name}_${props.pair}`}
      style={tailwind('p-1 border border-gray-300 rounded mr-2')}
      onPress={props.onPress}
    >
      <MaterialIcons size={24} name={props.name} style={tailwind('text-primary')} />
    </TouchableOpacity>
  )
}

function PoolPairInfoLine (props: { symbol: string, reserve: string, row: string }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between')}>
      <Text style={tailwind('text-sm font-semibold mb-1')}>Pooled {props.symbol}</Text>
      <NumberFormat
        suffix={` ${props.symbol}`}
        value={props.reserve} decimalScale={2} thousandSeparator displayType='text'
        renderText={value => {
          return <Text testID={`${props.row}_${props.symbol}`} style={tailwind('text-sm font-semibold')}>{value}</Text>
        }}
      />
    </View>
  )
}

function PoolPairAPR (props: { symbol: string, apr: number, row: string }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between items-end')}>
      <Text style={tailwind('text-sm font-semibold mb-1')}>{translate('screens/DexScreen', 'APR')}</Text>
      <NumberFormat
        suffix='%'
        value={new BigNumber(isNaN(props.apr) ? 0 : props.apr).times(100).toFixed(2)} decimalScale={2} thousandSeparator
        displayType='text'
        renderText={value => {
          return <Text testID={`${props.row}_${props.symbol}`} style={tailwind('text-xl font-semibold')}>{value}</Text>
        }}
      />
    </View>
  )
}
