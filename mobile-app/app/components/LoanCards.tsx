import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedView } from './themed'
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
}

type PriceType = 'ACTIVE' | 'NEXT'

export function LoanCards (props: LoanCardsProps): JSX.Element {
  return (
    <ThemedFlatList
      style={tailwind('px-2 pt-4 -mb-4')}
      data={props.loans}
      numColumns={2}
      renderItem={({ item, index }) => (
        <>
          {index !== props.loans.length - 1 &&
            (
              <LoadCard
                key={index}
                {...item}
              />
            )}
          {index === props.loans.length - 1 &&
            (
              <View style={[tailwind(''), { flex: 0.5 }]}>
                <LoadCard
                  key={index}
                  {...item}
                />
              </View>
            )}
        </>
      )}
    />
  )
}

function LoadCard ({
  loanName,
  priceType,
  price,
  interestRate
}: LoanCardOptions): JSX.Element {
  const LoanIcon = getNativeIcon(loanName)
  return (
    <ThemedView
      light={tailwind('bg-white')}
      style={[tailwind('p-4 mx-2 mb-4 rounded'), { flex: 1 }]}
    >
      <View style={tailwind('flex-row items-center pb-2')}>
        <LoanIcon width={24} height={24} style={tailwind('mr-2')} />
        <ThemedText style={tailwind('font-semibold')}>{loanName}</ThemedText>
      </View>
      <ThemedText
        light={tailwind('text-gray-500')}
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
    </ThemedView>
  )
}
