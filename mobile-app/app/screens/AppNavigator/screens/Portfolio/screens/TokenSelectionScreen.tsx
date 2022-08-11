import { useState, useMemo } from 'react'
import { View, Image } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { RootState } from '@store'
import { translate } from '@translations'
import { tokensSelector, WalletToken } from '@store/wallet'
import { useDebounce } from '@hooks/useDebounce'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import ImageEmptyAssets from '@assets/images/send/empty-assets.png'
import { ThemedFlatListV2, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { SearchInputV2 } from '@components/SearchInputV2'
import { ButtonV2 } from '@components/ButtonV2'
import { PortfolioParamList } from '../PortfolioNavigator'
import { ActiveUSDValueV2 } from '../../Loans/VaultDetail/components/ActiveUSDValueV2'

export interface TokenSelectionItem extends BottomSheetToken {
  usdAmount: BigNumber
}

export interface BottomSheetToken {
  tokenId: string
  available: BigNumber
  token: {
    name: string
    displaySymbol: string
    symbol: string
    isLPS?: boolean
  }
  factor?: string
  reserve?: string
}

type Props = StackScreenProps<PortfolioParamList, 'TokenSelectionScreen'>

export function TokenSelectionScreen (_props: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const [searchString, setSearchString] = useState('')
  const { getTokenPrice } = useTokenPrice()

  const debouncedSearchTerm = useDebounce(searchString, 250)

  const tokensWithBalance = getTokensWithBalance(tokens, getTokenPrice)
  const filteredTokensWithBalance = useMemo(() => {
    return filterTokensBySearchTerm(tokensWithBalance, debouncedSearchTerm)
  }, [tokensWithBalance, debouncedSearchTerm])

  if (tokensWithBalance.length === 0) {
    return <EmptyAsset navigation={navigation} />
  }

  return (
    <ThemedFlatListV2
      testID='token_selection_screen'
      style={tailwind('mb-4')}
      data={filteredTokensWithBalance}
      renderItem={({ item }: { item: TokenSelectionItem }): JSX.Element => {
        return (
          <TokenSelectionRow
            item={item}
            onPress={() => {
              navigation.navigate({
                name: 'Send',
                params: {
                  token: tokens.find(t => item.tokenId === t.id)
                },
                merge: true
              })
            }}
          />
        )
      }}
      ListEmptyComponent={
        <View style={tailwind('flex items-center justify-center')} />
      }
      ListHeaderComponent={
        <ThemedViewV2 style={tailwind('mx-5 mt-8')}>
          <SearchInputV2
            value={undefined}
            placeholder={translate('screens/TokenSelectionScreen', 'Search token')}
            showClearButton={false}
            onClearInput={() => { }}
            onChangeText={(text: string) => {
              setSearchString(text)
            }}
            onFocus={() => {
              // setIsSearchFocus(true)
              // setIsEditing(false)
            }}
            testID='address_search_input'
          />
          {filteredTokensWithBalance.length > 0 &&
            <ThemedTextV2
              style={tailwind('text-xs pl-5 mt-6 mb-2')}
              light={tailwind('text-mono-light-v2-500')}
              dark={tailwind('text-mono-dark-v2-500')}
            >
              {translate('screens/TokenSelectionScreen', 'AVAILABLE')}
            </ThemedTextV2>}
          {filteredTokensWithBalance.length === 0 &&
            <ThemedTextV2
              style={tailwind('text-xs pl-5 mt-8')}
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
            >
              {translate('screens/TokenSelectionScreen', 'Search results for "{{searchTerm}}"', { searchTerm: debouncedSearchTerm })}
            </ThemedTextV2>}

        </ThemedViewV2>
      }
      keyExtractor={(item) => item.tokenId}
    />
  )
}

interface TokenSelectionRowProps {
  item: TokenSelectionItem
  onPress: any
}

const TokenSelectionRow = ({ item, onPress }: TokenSelectionRowProps): JSX.Element => {
  const Icon = getNativeIcon(item.token.displaySymbol)
  return (
    <ThemedTouchableOpacityV2
      disabled={new BigNumber(item.available).lte(0)}
      onPress={onPress}
      light={tailwind('bg-mono-light-v2-00')}
      dark={tailwind('bg-mono-dark-v2-00')}
      style={tailwind('mx-5 mb-2 p-4 flex flex-row items-center justify-between rounded-lg')}
      testID={`select_${item.token.displaySymbol}`}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <Icon />
        <View style={tailwind('ml-2')}>
          <ThemedTextV2
            style={tailwind('font-semibold-v2 text-sm')}
            testID={`token_symbol_${item.token.displaySymbol}`}
          >
            {item.token.displaySymbol}
          </ThemedTextV2>
          <ThemedTextV2
            light={tailwind('text-mono-light-v2-700')}
            dark={tailwind('text-mono-dark-v2-700')}
            style={tailwind(['text-xs', { hidden: item.token.name === '' }])}
          >
            {item.token.name}
          </ThemedTextV2>
        </View>
      </View>
      <View style={tailwind('flex flex-col items-end mr-2')}>
        <NumberFormat
          value={item.available.toFixed(8)}
          thousandSeparator
          displayType='text'
          renderText={value =>
            <ThemedTextV2
              style={tailwind('font-semibold-v2 text-xs')}
              testID={`select_${item.token.displaySymbol}_value`}
            >
              {value}
            </ThemedTextV2>}
        />
        <ActiveUSDValueV2
          price={item.usdAmount}
          containerStyle={tailwind('justify-end')}
        />
      </View>
    </ThemedTouchableOpacityV2>
  )
}

function EmptyAsset ({ navigation }: { navigation: NavigationProp<PortfolioParamList> }): JSX.Element {
  return (
    <View style={tailwind('flex items-center justify-between mx-12 h-full')}>
      <View style={tailwind('flex items-center')}>
        <Image source={ImageEmptyAssets} style={[tailwind('mt-12'), { width: 204, height: 96 }]} />
        <ThemedTextV2 testID='no_asset_text' style={tailwind('font-semibold-v2 text-xl mt-8')}>
          {translate('screens/TokenSelectionScreen', 'No assets found')}
        </ThemedTextV2>
        <ThemedTextV2 testID='no_asset_sub_text' style={tailwind('mt-2')}>
          {translate('screens/TokenSelectionScreen', 'Add assets to get started')}
        </ThemedTextV2>
      </View>
      <ButtonV2
        onPress={() => navigation.navigate('GetDFIScreen')}
        styleProps='w-full mb-14 pb-1'
        label={translate('screens/GetDFIScreen', 'Get DFI')}
      />
    </View>
  )
}

function getTokensWithBalance (tokens: WalletToken[], getTokenPrice: (symbol: string, amount: BigNumber, isLPS?: boolean | undefined) => BigNumber): TokenSelectionItem[] {
  const reservedFees = 0.1
  return tokens.filter(t => {
    return new BigNumber(t.amount).isGreaterThan(0) && t.id !== '0' && t.id !== '0_utxo'
  }).map(t => {
    const activePrice = getTokenPrice(t.symbol, new BigNumber('1'), t.isLPS)
    const available = new BigNumber(t.displaySymbol === 'DFI' ? new BigNumber(t.amount).minus(reservedFees).toFixed(8) : t.amount)
    const token: TokenSelectionItem = {
      tokenId: t.id,
      available,
      token: {
        name: t.name,
        displaySymbol: t.displaySymbol,
        symbol: t.symbol,
        isLPS: t.isLPS
      },
      usdAmount: new BigNumber(available).multipliedBy(activePrice)
    }
    return token
  }).sort((a, b) => b.usdAmount.minus(a.usdAmount).toNumber())
}

function filterTokensBySearchTerm (tokens: TokenSelectionItem[], searchTerm: string): TokenSelectionItem[] {
  return tokens.filter(t => [t.token.displaySymbol, t.token.name].some((searchItem) => searchItem.toLowerCase().includes(searchTerm.trim().toLowerCase())))
}
