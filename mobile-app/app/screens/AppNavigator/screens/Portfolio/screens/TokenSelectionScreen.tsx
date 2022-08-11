import { View, Image } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { RootState } from '@store'
import { tokensSelector, WalletToken } from '@store/wallet'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { ThemedFlatListV2, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { getNativeIcon } from '@components/icons/assets'
import { ActiveUSDValueV2 } from '../../Loans/VaultDetail/components/ActiveUSDValueV2'
import { SearchInputV2 } from '@components/SearchInputV2'
import ImageEmptyAssets from '@assets/images/send/empty-assets.png'
import { ButtonV2 } from '@components/ButtonV2'
import { translate } from '@translations'

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
  const { getTokenPrice } = useTokenPrice()
  const tokensWithBalance = getTokensWithBalance(tokens, getTokenPrice)

  if (tokensWithBalance.length === 0) {
    return <EmptyAsset navigation={navigation} />
  }

  return (
    <ThemedFlatListV2
      testID='token_selection_screen'
      style={tailwind('mb-4')}
      data={tokensWithBalance}
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
            placeholder='Search token to send'
            showClearButton={false}
            onClearInput={() => { }}
            onChangeText={(text: string) => {
              // setSearchString(text)
            }}
            onFocus={() => {
              // setIsSearchFocus(true)
              // setIsEditing(false)
            }}
            testID='address_search_input'
          />
          <ThemedTextV2
            style={tailwind('text-xs pl-5 mt-6 mb-2')}
            light={tailwind('text-mono-light-v2-500')}
            dark={tailwind('text-mono-dark-v2-500')}
          >
            AVAILABLE
          </ThemedTextV2>

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
            style={tailwind('font-bold')}
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
              style={tailwind('font-bold')}
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
        <ThemedTextV2 style={tailwind('font-semibold-v2 text-xl mt-8')}>
          No assets found
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind('mt-2')}>
          Add asset to get started
        </ThemedTextV2>
      </View>
      <ButtonV2
        onPress={() => navigation.navigate('GetDFIScreen')}
        styleProps='w-full mb-14 pb-1'
        label={translate('screens/TokenDetailScreen', 'Get DFI')}
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
