import BigNumber from 'bignumber.js'
import { View } from '@components'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedText,
  ThemedView
} from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ActionSection } from './ActionSection'
import { PoolPairTextSection } from './PoolPairTextSection'
import { InfoSection } from './InfoSection'
import { APRSection } from './APRSection'
import { useTokenPrice } from '@screens/AppNavigator/screens/Balances/hooks/TokenPrice'
import { PriceRatesSection } from './PriceRatesSection'
import Collapsible from 'react-native-collapsible'
import { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { WalletToken } from '@store/wallet'
import { useDebounce } from '@hooks/useDebounce'
import { useFavouritePoolpairs } from '../../hook/FavouritePoolpairs'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import NumberFormat from 'react-number-format'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import { ButtonGroup } from '../ButtonGroup'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { TotalValueLocked } from '../TotalValueLocked'

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

export enum ButtonGroupTabKey {
  AllPairs = 'All_PAIRS',
  DFIPairs = 'DFI_PAIRS',
  DUSDPairs = 'DUSD_PAIRS'
}

interface PoolPairCardProps {
  availablePairs: Array<DexItem<PoolPairData>>
  yourPairs: Array<DexItem<WalletToken>>
  onAdd: (data: PoolPairData) => void
  onRemove: (data: PoolPairData) => void
  type: 'your' | 'available'
  setIsSearching: (isSearching: boolean) => void
  searchString: string
  onButtonGroupPress?: (key: ButtonGroupTabKey) => void
  showSearchInput?: boolean
}

export function PoolPairCards ({
  availablePairs,
  onAdd,
  onRemove,
  type,
  searchString,
  setIsSearching,
  yourPairs,
  onButtonGroupPress,
  showSearchInput
}: PoolPairCardProps): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const sortedPairs = sortPoolpairsByFavourite(
    availablePairs,
    isFavouritePoolpair
  )
  const { getTokenPrice, calculatePriceRates } = useTokenPrice()
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([])

  const [filteredYourPairs, setFilteredYourPairs] =
    useState<Array<DexItem<WalletToken>>>(yourPairs)
  const debouncedSearchTerm = useDebounce(searchString, 2000)
  const { tvl } = useSelector((state: RootState) => state.block)
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.AllPairs,
      label: translate('screens/DexScreen', 'All pairs'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllPairs)
    },
    {
      id: ButtonGroupTabKey.DFIPairs,
      label: translate('screens/DexScreen', 'DFI pairs'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.DFIPairs)
    },
    {
      id: ButtonGroupTabKey.DUSDPairs,
      label: translate('screens/DexScreen', 'DUSD pairs'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.DUSDPairs)
    }
  ]
  const [activeButtonGroup, setActiveButtonGroup] = useState<string>(ButtonGroupTabKey.AllPairs)
  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    setActiveButtonGroup(buttonGroupTabKey)
    if (onButtonGroupPress !== undefined) {
      onButtonGroupPress(buttonGroupTabKey)
    }
  }

  useEffect(() => {
    setIsSearching(false)
    setFilteredYourPairs(
      yourPairs.filter((pair) =>
        pair.data.displaySymbol
          .toLowerCase()
          .includes(debouncedSearchTerm.trim().toLowerCase())
      )
    )
  }, [yourPairs, debouncedSearchTerm])

  const renderItem = ({
    item,
    index
  }: {
    item: DexItem<WalletToken | PoolPairData>
    index: number
  }): JSX.Element => {
    const { data: yourPair } = item
    const poolPairData = availablePairs.find(
      (pr) => pr.data.symbol === (yourPair as AddressToken).symbol
    )
    const mappedPair = poolPairData?.data

    const [symbolA, symbolB] =
      mappedPair?.tokenA != null && mappedPair?.tokenB != null
        ? [mappedPair.tokenA.displaySymbol, mappedPair.tokenB.displaySymbol]
        : yourPair.symbol.split('-')
    const toRemove = new BigNumber(1)
      .times((yourPair as WalletToken).amount)
      .decimalPlaces(8, BigNumber.ROUND_DOWN)
    const ratioToTotal = toRemove.div(mappedPair?.totalLiquidity?.token ?? 1)
    const symbol = `${symbolA}-${symbolB}`

    // assume defid will trim the dust values too
    const tokenATotal = ratioToTotal
      .times(mappedPair?.tokenA.reserve ?? 0)
      .decimalPlaces(8, BigNumber.ROUND_DOWN)
    const tokenBTotal = ratioToTotal
      .times(mappedPair?.tokenB.reserve ?? 0)
      .decimalPlaces(8, BigNumber.ROUND_DOWN)
    const priceRates = calculatePriceRates(
      mappedPair?.tokenA.symbol ?? '',
      poolPairData?.data != null ? [poolPairData?.data] : [],
      new BigNumber('1')
    )
    const isExpanded = expandedCardIds.some((id) => id === yourPair.id)

    const onCollapseToggle = (): void =>
      setExpandedCardIds(
        isExpanded
          ? expandedCardIds.filter((id) => id !== yourPair.id)
          : [...expandedCardIds, yourPair.id]
      )

    const isFavouritePair = isFavouritePoolpair(yourPair.id)

    if (mappedPair === undefined) {
      return <></>
    }

    return (
      <ThemedView
        dark={tailwind('bg-gray-800 border-gray-700')}
        light={tailwind('bg-white border-gray-200')}
        style={tailwind('p-4 mb-2 border rounded')}
        testID={type === 'your' ? 'pool_pair_row_your' : 'pool_pair_row'}
      >
        <View
          style={tailwind('flex flex-row justify-between')}
          testID={`pool_pair_row_${index}_${symbol}`}
        >
          <PoolPairTextSection
            symbolA={symbolA}
            symbolB={symbolB}
            pairId={yourPair.id}
            isFavouritePair={isFavouritePair}
            setFavouritePoolpair={setFavouritePoolpair}
          />
          {mappedPair?.apr?.total !== undefined && mappedPair?.apr?.total !== null && (
            <APRSection
              label={`${translate('screens/DexScreen', 'APR')}: `}
              value={{
                text: new BigNumber(
                  isNaN(mappedPair.apr.total) ? 0 : mappedPair.apr.total
                )
                  .times(100)
                  .toFixed(2),
                decimalScale: 2,
                testID: `apr_${symbol}`,
                suffix: '%'
              }}
            />
          )}
        </View>
        {/* TODO(PIERRE): Check how to optimize a lot of reloads happening here */}
        {type === 'available'
          ? (
            <PriceRatesSection
              {...getSortedPriceRates({
                mappedPair,
                aToBPrice: priceRates.aToBPrice,
                bToAPrice: priceRates.bToAPrice
              })}
            />
          )
          : (
            <View style={tailwind('flex flex-col mt-2')}>
              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                style={tailwind('text-xs font-normal leading-3 mt-1')}
              >
                {translate('screens/DexScreen', 'Your share in pool')}
              </ThemedText>
              <NumberFormat
                decimalScale={8}
                displayType='text'
                renderText={(textValue) => (
                  <ThemedText
                    testID={`share_in_pool_${symbol}`}
                    style={tailwind('text-sm leading-4 font-semibold mb-1 mt-2')}
                  >
                    {textValue}
                  </ThemedText>
                )}
                thousandSeparator
                value={(yourPair as WalletToken).amount}
              />
              <ActiveUSDValue
                price={getTokenPrice(
                  yourPair.symbol,
                  new BigNumber((yourPair as WalletToken).amount),
                  true
                )}
                testId={`share_in_pool_${symbol}_USD`}
              />
            </View>
          )}
        <View
          style={tailwind('flex flex-row justify-between items-center mt-2')}
        >
          <ActionSection
            onAdd={() => onAdd(mappedPair)}
            onRemove={() => onRemove(mappedPair)}
            symbol={symbol}
            type={type}
            pair={mappedPair}
          />
          <TouchableOpacity
            onPress={onCollapseToggle}
            style={tailwind('flex flex-row mt-1 pt-0.5')}
            testID={`details_${symbol}`}
          >
            <ThemedText
              style={tailwind('text-sm font-medium')}
              light={tailwind('text-primary-500')}
              dark={tailwind('text-darkprimary-500')}
            >
              {!isExpanded ? translate('screens/DexScreen', 'DETAILS') : translate('screens/DexScreen', 'HIDE')}
            </ThemedText>
            <ThemedIcon
              light={tailwind('text-primary-500 ml-0.5')}
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              name={!isExpanded ? 'expand-more' : 'expand-less'}
              size={20}
            />
          </TouchableOpacity>
        </View>
        <Collapsible collapsed={!isExpanded}>
          <ThemedView
            style={tailwind('border-b h-px mt-4')}
            light={tailwind('border-gray-100')}
            dark={tailwind('border-gray-700')}
          />
          <InfoSection
            type={type}
            pair={mappedPair}
            tokenATotal={
              type === 'your'
                ? tokenATotal.toFixed(8)
                : mappedPair?.tokenA.reserve
            }
            tokenBTotal={
              type === 'your'
                ? tokenBTotal.toFixed(8)
                : mappedPair?.tokenB.reserve
            }
            testID={type}
          />
        </Collapsible>
      </ThemedView>
    )
  }
  return (
    <ThemedFlatList
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={type === 'your' ? filteredYourPairs : sortedPairs}
      numColumns={1}
      windowSize={2}
      initialNumToRender={5}
      keyExtractor={(_item, index) => index.toString()}
      testID={
        type === 'your' ? 'your_liquidity_tab' : 'available_liquidity_tab'
      }
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          {type === 'available' &&
            showSearchInput === false &&
            (
              <>
                <View style={tailwind('mb-4')}>
                  <ButtonGroup buttons={buttonGroup} activeButtonGroupItem={activeButtonGroup} />
                </View>
                <View style={tailwind('mb-4')}>
                  <TotalValueLocked tvl={tvl ?? 0} />
                </View>
              </>
            )}
        </>
      }
    />
  )
}

function getSortedPriceRates ({
  mappedPair,
  aToBPrice,
  bToAPrice
}: {
  mappedPair: PoolPairData
  aToBPrice: BigNumber
  bToAPrice: BigNumber
}): {
  tokenA: {
    symbol: string
    displaySymbol: string
    priceRate: BigNumber
  }
  tokenB: {
    symbol: string
    displaySymbol: string
    priceRate: BigNumber
  }
} {
  const tokenA = {
    symbol: mappedPair.tokenA.symbol,
    displaySymbol: mappedPair.tokenA.displaySymbol,
    priceRate: aToBPrice
  }
  const tokenB = {
    symbol: mappedPair.tokenB.symbol,
    displaySymbol: mappedPair.tokenB.displaySymbol,
    priceRate: bToAPrice
  }

  if (
    mappedPair.tokenB.symbol === 'DFI' ||
    (mappedPair.tokenB.symbol === 'DUSD' && mappedPair.tokenA.symbol !== 'DFI')
  ) {
    return {
      tokenA: tokenB,
      tokenB: tokenA
    }
  }

  return {
    tokenA,
    tokenB
  }
}

function sortPoolpairsByFavourite (
  pairs: Array<DexItem<PoolPairData>>,
  isFavouritePair: (id: string) => boolean
): Array<DexItem<PoolPairData>> {
  return pairs.slice().sort((firstPair, secondPair) => {
    if (isFavouritePair(firstPair.data.id)) {
      return -1
    }
    if (isFavouritePair(secondPair.data.id)) {
      return 1
    }
    return 0
  })
}
