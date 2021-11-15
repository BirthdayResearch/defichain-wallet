import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from './themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { View } from 'react-native'
import { getNativeIcon } from './icons/assets'
import { InfoText } from './InfoText'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
// import { NavigationProp, useNavigation } from '@react-navigation/core'
// import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'

interface LoanCardsProps {
  loans: LoanToken[]
  testID?: string
}

export interface LoanCardOptions {
  loanTokenId: string
  displaySymbol: string
  price?: ActivePrice
  interestRate: string
  onPress: () => void
  testID: string
}

export function LoanCards (props: LoanCardsProps): JSX.Element {
  // const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const { isBetaFeature } = useFeatureFlagContext()
  return (
    <>
      {isBetaFeature('loan') && (
        <View style={tailwind('p-4 pb-0')}>
          <InfoText
            testID='beta_warning_info_text'
            text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
          />
        </View>
      )}
      <ThemedFlatList
        contentContainerStyle={tailwind('px-2 pt-4 pb-2')}
        data={props.loans}
        numColumns={2}
        renderItem={({
          item,
          index
        }: { item: LoanToken, index: number }): JSX.Element => {
          // TODO: Update to one element, just add the condition on style
          if (index !== props.loans.length - 1) {
            return (
              <LoanCard
                displaySymbol={item.token.displaySymbol}
                interestRate={item.interest}
                price={item.activePrice}
                loanTokenId={item.tokenId}
                onPress={() => {
                  // TODO: navigate to borrow loan token screen
                  // navigation.navigate({

                  // })
                }}
                testID={`loan_card_${index}`}
              />
            )
          } else {
            return (
              <View style={{ flexBasis: '50%' }}>
                <LoanCard
                  displaySymbol={item.token.displaySymbol}
                  interestRate={item.interest}
                  price={item.activePrice}
                  loanTokenId={item.tokenId}
                  onPress={() => {
                    // TODO: navigate to borrow loan token screen
                    // navigation.navigate({

                    // })
                  }}
                  testID={`loan_card_${index}`}
                />
              </View>
            )
          }
        }}
        keyExtractor={(_item, index) => index.toString()}
        testID={props.testID}
      />
    </>
  )
}

function LoanCard ({
  displaySymbol,
  price,
  interestRate,
  onPress,
  testID
}: LoanCardOptions): JSX.Element {
  const LoanIcon = getNativeIcon(displaySymbol)
  const currentPrice = price?.active?.amount ?? 0
  return (
    <ThemedTouchableOpacity
      testID={testID}
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
        value={(currentPrice > 0 ? new BigNumber(currentPrice).toFixed(2) : '-')}
      />
    </ThemedTouchableOpacity>
  )
}
