import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from './themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { View } from 'react-native'
import { getNativeIcon } from './icons/assets'

interface LoanCardsProps {
  loans: LoanCardOptions[]
}

export interface LoanCardOptions {
  loanName: string
  priceType: PriceType
  price: BigNumber
  isVerified: boolean
  interestRate: BigNumber
  onPress: () => void
}

type PriceType = 'ACTIVE' | 'NEXT'

export function LoanCards (props: LoanCardsProps): JSX.Element {
  return (
    <ThemedFlatList
      style={tailwind('px-2 pt-4 -mb-4')}
      data={props.loans}
      numColumns={2}
      renderItem={({ item, index }): JSX.Element => {
        if (index !== props.loans.length - 1) {
          return (
            <LoadCard
              {...item}
            />
          )
        } else {
          return (
            <View style={{ flex: 0.5 }}>
              <LoadCard
                {...item}
              />
            </View>
          )
        }
      }}
      keyExtractor={(_item, index) => index.toString()}
    />
  )
}

function LoadCard ({
  loanName,
  priceType,
  price,
  interestRate,
  onPress
}: LoanCardOptions): JSX.Element {
  const LoanIcon = getNativeIcon(loanName)
  return (
    <ThemedTouchableOpacity
      style={tailwind('p-4 mx-2 mb-4 rounded flex-1')}
      onPress={onPress}
    >
      <View style={tailwind('flex-row items-center pb-2')}>
        <LoanIcon width={24} height={24} style={tailwind('mr-2')} />
        <ThemedText style={tailwind('font-semibold')}>{loanName}</ThemedText>
      </View>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
      >
        {priceType === 'ACTIVE' ? translate('components/LoanCard', 'Active Price') : translate('components/LoanCard', 'Next Price')}
      </ThemedText>
      <NumberFormat
        decimalScale={2}
        thousandSeparator
        displayType='text'
        renderText={(value) =>
          <View style={tailwind('flex flex-row items-center pb-2')}>
            <ThemedText style={tailwind('text-sm font-semibold mr-1')}>
              ${value}
            </ThemedText>
            <ThemedIcon
              iconType='MaterialIcons'
              name='check-circle'
              size={10}
              light={tailwind('text-success-500')}
              dark={tailwind('text-darksuccess-500')}
            />
          </View>}
        value={new BigNumber(price).toFixed(2)}
      />
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
          <>
            <ThemedText style={tailwind('text-sm font-semibold')}>
              {value}
            </ThemedText>
          </>}
        value={new BigNumber(interestRate).toFixed(2)}
        suffix='%'
      />
    </ThemedTouchableOpacity>
  )
}
