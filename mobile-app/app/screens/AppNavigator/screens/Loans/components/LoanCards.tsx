import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { View } from 'react-native'

import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { InfoText } from '@components/InfoText'
import { getNativeIcon } from '@components/icons/assets'
import { LoanToken, LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { LoanParamList } from '../LoansNavigator'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { vaultsSelector } from '@store/loans'

interface LoanCardsProps {
  loans: LoanToken[]
  testID?: string
  vaultId?: string
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
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const activeVault = vaults.find((v) => v.vaultId === props.vaultId && v.state !== LoanVaultState.IN_LIQUIDATION) as LoanVaultActive
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
      testID={`loan_card_${displaySymbol}`}
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
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
        light={tailwind('text-dfxgray-500')}
        dark={tailwind('text-dfxgray-400')}
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
        light={tailwind('text-dfxgray-500')}
        dark={tailwind('text-dfxgray-400')}
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
