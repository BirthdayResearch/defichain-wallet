
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { View } from 'react-native'
import { getNativeIcon } from '@components/icons/assets'
import { LoanToken, LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { LoanParamList } from '../LoansNavigator'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { vaultsSelector } from '@store/loans'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'

interface LoanCardsProps {
  loans: LoanToken[]
  testID?: string
  vaultId?: string
}

export interface LoanCardOptions {
  loanTokenId: string
  symbol: string
  displaySymbol: string
  price?: ActivePrice
  interestRate: string
  onPress: () => void
  testID: string
}

export function LoanCards (props: LoanCardsProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const activeVault = vaults.find((v) => v.vaultId === props.vaultId && v.state !== LoanVaultState.IN_LIQUIDATION) as LoanVaultActive
  return (
    <>
      <ThemedFlatList
        contentContainerStyle={tailwind('px-2 pt-4 pb-2')}
        data={props.loans}
        numColumns={2}
        renderItem={({
          item,
          index
        }: { item: LoanToken, index: number }): JSX.Element => {
          return (
            <View style={{ flexBasis: '50%' }}>
              <LoanCard
                symbol={item.token.symbol}
                displaySymbol={item.token.displaySymbol}
                interestRate={item.interest}
                price={item.activePrice}
                loanTokenId={item.tokenId}
                onPress={() => {
                  navigation.navigate({
                    name: 'BorrowLoanTokenScreen',
                    params: {
                      loanToken: item,
                      vault: activeVault
                    },
                    merge: true
                  })
                }}
                testID={`loan_card_${index}`}
              />
            </View>
          )
        }}
        keyExtractor={(_item, index) => index.toString()}
        testID={props.testID}
      />
    </>
  )
}

function LoanCard ({
  symbol,
  displaySymbol,
  price,
  interestRate,
  onPress,
  testID
}: LoanCardOptions): JSX.Element {
  const LoanIcon = getNativeIcon(displaySymbol)
  const currentPrice = getUSDPrecisedPrice(getActivePrice(symbol, price))
  return (
    <ThemedTouchableOpacity
      testID={`loan_card_${displaySymbol}`}
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mx-2 mb-4 rounded flex-1 border')}
      onPress={onPress}
    >
      <View style={tailwind('flex-row items-center pb-2 justify-between')}>
        <View style={tailwind('flex flex-row')}>
          <LoanIcon width={24} height={24} style={tailwind('mr-2')} />
          <ThemedText testID={`${testID}_display_symbol`} style={tailwind('font-medium')}>{displaySymbol}</ThemedText>
        </View>
        <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={20} style={tailwind('-mr-2')} />
      </View>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
      >
        {translate('components/LoanCard', 'Interest')}
      </ThemedText>
      <NumberFormat
        decimalScale={2}
        thousandSeparator
        displayType='text'
        renderText={(value) =>
          <ThemedText testID={`${testID}_interest_rate`} style={tailwind('text-sm pb-2')}>
            {value}
          </ThemedText>}
        value={interestRate}
        suffix='%'
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
      >
        {translate('components/LoanCard', 'Price (USD)')}
      </ThemedText>
      <NumberFormat
        decimalScale={2}
        thousandSeparator
        displayType='text'
        renderText={(value) =>
          <View style={tailwind('flex flex-row items-center')}>
            <ThemedText testID={`${testID}_loan_amount`} style={tailwind('text-sm mr-1')}>
              ${value}
            </ThemedText>
          </View>}
        value={currentPrice}
      />
    </ThemedTouchableOpacity>
  )
}
