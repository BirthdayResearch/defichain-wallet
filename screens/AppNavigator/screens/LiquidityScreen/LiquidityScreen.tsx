import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { SectionList, TouchableOpacity } from 'react-native'
import NumberFormat from "react-number-format";
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { getTokenIcon } from "../../../../components/icons/tokens/_index";
import { PrimaryColor, VectorIcon } from '../../../../constants/Theme';
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { translate } from '../../../../translations'

export function LiquidityScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
  const [pairs, setPairs] = useState<Array<DexItem<PoolPairData>>>([])

  useEffect(() => {
    // TODO(fuxingloh): does not auto refresh currently, but not required for MVP. Due to limited PP
    whaleApiClient.poolpair.list(50).then(pairs => {
      setPairs(pairs.map(data => ({ type: 'available', data: data })))
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  return (
    <SectionList
      testID={'liquidity_screen_list'}
      style={tailwind('bg-gray-100')}
      sections={[
        {
          key: 'Available pool pairs',
          data: pairs,
          renderItem: ({ item }) => PoolPairRow(item.data)
        }
      ]}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      renderSectionHeader={({ section }) => {
        return (
          <Text style={tailwind('pt-5 pb-4 px-4 font-bold bg-gray-100')}>
            {translate('app/LiquidityScreen', section.key || '')}
          </Text>
        )
      }}
      keyExtractor={(item, index) => `${index}`}
    />
  )
}

interface DexItem<T> {
  type: 'available'
  data: T
}

function PoolPairRow (data: PoolPairData): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getTokenIcon(symbolA)
  const IconB = getTokenIcon(symbolB)

  return (
    <View testID={'pool_pair_row'} style={tailwind('bg-white')}>
      <View style={tailwind('ml-4 mt-4 flex-row items-center justify-between')}>
        <View style={tailwind('flex-row')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <Text style={tailwind('text-lg')}>{data.symbol}</Text>
        </View>

        <View style={tailwind('flex-row')}>
          <PoolPairInfoButton name={'remove'} />
          <PoolPairInfoButton name={'add'} />
        </View>
      </View>

      <View style={tailwind('p-4')}>
        <PoolPairInfoLine symbol={symbolA} reserve={data.tokenA.reserve.toFixed()} />
        <PoolPairInfoLine symbol={symbolB} reserve={data.tokenB.reserve.toFixed()} />
      </View>
    </View>
  )
}

function PoolPairInfoButton (props: { name: 'remove' | 'add' }): JSX.Element {
  return (
    <TouchableOpacity style={tailwind('py-2 px-3')}>
      <VectorIcon size={24} name={props.name} color={PrimaryColor} />
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
