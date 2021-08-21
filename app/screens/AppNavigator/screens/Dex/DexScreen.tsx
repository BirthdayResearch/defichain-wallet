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
import { getNativeIcon } from '../../../../components/icons/assets'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useThemeContext } from '../../../../contexts/ThemeProvider'
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
  const { getThemeClass } = useThemeContext()
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
            }, getThemeClass, poolPairData?.data)
          case 'available':
            return PoolPairRowAvailable(item.data,
              () => onAdd(item.data),
              () => navigation.navigate({ name: 'PoolSwap', params: { poolpair: item.data }, merge: true }),
              getThemeClass
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
              <View style={tailwind('px-4 pt-4 pb-2', getThemeClass('body-bg'))}>
                <Text style={tailwind('text-base font-medium', getThemeClass('body-text'))}>
                  {
                    translate('screens/DexScreen', 'Pick a pool pair below, supply liquidity to power the Decentralized Exchange (DEX), and start earning fees and annual returns of up to 100%. Withdraw at any time.')
                  }
                </Text>
              </View>
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

function PoolPairRowYour (data: AddressToken, onAdd: () => void, onRemove: () => void, getThemeClass: (type: string) => string, pair?: PoolPairData): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getNativeIcon(symbolA)
  const IconB = getNativeIcon(symbolB)
  const toRemove = new BigNumber(1).times(data.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
  const ratioToTotal = toRemove.div(pair?.totalLiquidity?.token ?? 1)
  // assume defid will trim the dust values too
  const tokenATotal = ratioToTotal.times(pair?.tokenA.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)
  const tokenBTotal = ratioToTotal.times(pair?.tokenB.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)

  return (
    <View testID='pool_pair_row_your' style={tailwind('p-4', getThemeClass('row-bg'))}>
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <Text style={tailwind('text-lg font-bold', getThemeClass('body-text'))}>{data.symbol}</Text>
        </View>
        <View style={tailwind('flex-row -mr-3')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} getThemeClass={getThemeClass} />
          <PoolPairLiqBtn name='remove' onPress={onRemove} pair={data.symbol} getThemeClass={getThemeClass} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        <PoolPairInfoLine
          symbol={data.symbol} reserve={data.amount} row='your' decimalScale={8}
          getThemeClass={getThemeClass}
        />
        {
          pair !== undefined && (
            <>
              <PoolPairInfoLine
                symbol={symbolA} reserve={tokenATotal.toFixed(8)} row='tokenA' decimalScale={8}
                getThemeClass={getThemeClass}
              />
              <PoolPairInfoLine
                symbol={symbolB} reserve={tokenBTotal.toFixed(8)} row='tokenB' decimalScale={8}
                getThemeClass={getThemeClass}
              />
            </>
          )
        }
      </View>
    </View>
  )
}

function PoolPairRowAvailable (data: PoolPairData, onAdd: () => void, onSwap: () => void, getThemeClass: (type: string) => string): JSX.Element {
  const [symbolA, symbolB] = data.symbol.split('-')
  const IconA = getNativeIcon(symbolA)
  const IconB = getNativeIcon(symbolB)

  return (
    <View testID='pool_pair_row' style={tailwind('p-4', getThemeClass('row-bg row-border'))}>
      <View style={tailwind('flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <IconA width={32} height={32} />
          <IconB width={32} height={32} style={tailwind('-ml-3 mr-3')} />
          <Text
            testID={`your_symbol_${symbolA}-${symbolB}`}
            style={tailwind('text-lg font-bold', getThemeClass('body-text'))}
          >{data.symbol}
          </Text>
        </View>

        <View style={tailwind('flex-row -mr-2')}>
          <PoolPairLiqBtn name='add' onPress={onAdd} pair={data.symbol} getThemeClass={getThemeClass} />
          <PoolPairLiqBtn name='swap-horiz' onPress={onSwap} pair={data.symbol} getThemeClass={getThemeClass} />
        </View>
      </View>

      <View style={tailwind('mt-4')}>
        {
          data.apr?.total !== undefined &&
            <PoolPairAPR symbol={`${symbolA}-${symbolB}`} apr={data.apr.total} row='apr' getThemeClass={getThemeClass} />
        }
        <PoolPairInfoLine
          symbol={symbolA} reserve={data.tokenA.reserve} row='available' decimalScale={2}
          getThemeClass={getThemeClass}
        />
        <PoolPairInfoLine
          symbol={symbolB} reserve={data.tokenB.reserve} row='available' decimalScale={2}
          getThemeClass={getThemeClass}
        />
      </View>
    </View>
  )
}

function PoolPairLiqBtn (props: { name: React.ComponentProps<typeof MaterialIcons>['name'], pair: string, onPress?: () => void, getThemeClass: (type: string) => string }): JSX.Element {
  return (
    <TouchableOpacity
      testID={`pool_pair_${props.name}_${props.pair}`}
      style={tailwind('p-1 border border-gray-300 rounded mr-2')}
      onPress={props.onPress}
    >
      <MaterialIcons size={24} name={props.name} style={tailwind(props.getThemeClass('text-primary'))} />
    </TouchableOpacity>
  )
}

function PoolPairInfoLine (props: { symbol: string, reserve: string, row: string, decimalScale: number, getThemeClass: (type: string) => string }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between')}>
      <Text style={tailwind('text-sm font-medium mb-1', props.getThemeClass('body-text'))}>Pooled {props.symbol}</Text>
      <NumberFormat
        suffix={` ${props.symbol}`}
        value={props.reserve} decimalScale={props.decimalScale} thousandSeparator displayType='text'
        renderText={value => {
          return (
            <Text
              testID={`${props.row}_${props.symbol}`}
              style={tailwind('text-sm', props.getThemeClass('body-text'))}
            >{value}
            </Text>
          )
        }}
      />
    </View>
  )
}

function PoolPairAPR (props: { symbol: string, apr: number, row: string, getThemeClass: (type: string) => string }): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-between items-end')}>
      <Text
        style={tailwind('text-sm font-medium mb-1', props.getThemeClass('body-text'))}
      >{translate('screens/DexScreen', 'APR')}
      </Text>
      <NumberFormat
        suffix='%'
        value={new BigNumber(isNaN(props.apr) ? 0 : props.apr).times(100).toFixed(2)} decimalScale={2} thousandSeparator
        displayType='text'
        renderText={value => {
          return (
            <Text
              testID={`${props.row}_${props.symbol}`}
              style={tailwind('text-xl', props.getThemeClass('body-text'))}
            >{value}
            </Text>
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
