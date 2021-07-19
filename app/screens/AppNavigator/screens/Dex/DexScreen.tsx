import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { SectionList, TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Text, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { fetchTokens } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

export function DexScreen (): JSX.Element {
  const client = useWhaleApiClient()
  const address = useSelector((state: RootState) => state.wallet.address)
  const [pairs, setPairs] = useState<Array<DexItem<PoolPairData>>>([])
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  useEffect(() => {
    // TODO(fuxingloh): does not auto refresh currently, but not required for MVP. Due to limited PP availability
    fetchTokens(client, address, dispatch)
    client.poolpair.list(50).then(pairs => {
      setPairs(pairs.map(data => ({ type: 'available', data: data })))
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const yourLPTokens = useSelector<RootState, Array<DexItem<AddressToken>>>(({ wallet }: RootState) => {
    return wallet.tokens.filter(({ isLPS }) => isLPS).map(data => ({ type: 'your', data: data }))
  })

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
          key: 'Available pool pairs',
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
            <Text style={tailwind('pt-5 pb-4 px-4 font-bold bg-gray-100')}>
              Your liquidity
            </Text>
          )
        }
        return (
          <View style={tailwind('px-4 pt-4 pb-2')}>
            <Text style={tailwind('text-sm')}>
              Pick a pool pair below, supply liquidity to power the Decentralized Exchange (DEX) to start earning fees
              and annual returns of up to 100%. You can withdraw any time.
            </Text>
          </View>
        )
      }}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      renderSectionHeader={({ section }) => {
        if (section.key === undefined) {
          return null
        }
        return (
          <Text style={tailwind('pt-5 pb-4 px-4 font-bold bg-gray-100')}>
            {translate('app/DexScreen', section.key)}
          </Text>
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
          <Text style={tailwind('text-lg')}>{data.symbol}</Text>
        </View>
        <View style={tailwind('flex-row -mr-3')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} />
          <PoolPairLiqBtn name='remove' onPress={onRemove} pair={data.symbol} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        <PoolPairInfoLine symbol={data.symbol} reserve={data.amount} />
      </View>
    </View>
  )
}

function PoolPairRowAvailable (data: PoolPairData, onAdd: () => void, onSwap: () => void): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getTokenIcon(symbolA)
  const IconB = getTokenIcon(symbolB)

  return (
    <View testID='pool_pair_row' style={tailwind('p-4 bg-white')}>
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <Text style={tailwind('text-lg')}>{data.symbol}</Text>
        </View>

        <View style={tailwind('flex-row -mr-2')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} />
          <PoolPairSwapBtn symbol={data.symbol} onPress={onSwap} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        <PoolPairInfoLine symbol={symbolA} reserve={data.tokenA.reserve} />
        <PoolPairInfoLine symbol={symbolB} reserve={data.tokenB.reserve} />
      </View>
    </View>
  )
}

function PoolPairLiqBtn (props: { name: 'remove' | 'add', pair: string, onPress?: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID={`pool_pair_${props.name}_${props.pair}`}
      style={tailwind('py-2 px-3')}
      onPress={props.onPress}
    >
      <MaterialIcons size={24} name={props.name} style={tailwind('text-primary')} />
    </TouchableOpacity>
  )
}

function PoolPairSwapBtn ({ symbol, onPress }: { symbol: string, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID={`button_swap_${symbol}`} style={tailwind('py-2 px-3 flex-row items-center')}
      onPress={onPress}
    >
      <Text style={tailwind('font-bold text-primary')}>{translate('screens/DexScreen', 'SWAP')}</Text>
    </TouchableOpacity>
  )
}

function PoolPairInfoLine (props: { symbol: string, reserve: string }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between')}>
      <Text style={tailwind('text-sm')}>Pooled {props.symbol}</Text>
      <NumberFormat
        value={props.reserve} decimalScale={2} thousandSeparator displayType='text'
        renderText={value => {
          return <Text>{value} {props.symbol}</Text>
        }}
      />
    </View>
  )
}
