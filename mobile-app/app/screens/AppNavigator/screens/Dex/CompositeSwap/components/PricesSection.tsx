import React from 'react'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedSectionTitle } from '@components/themed'
import { TextRow } from '@components/TextRow'

export interface PriceRateProps {label: string, value: string}

export function PricesSection ({ priceRates, sectionTitle }: {priceRates: PriceRateProps[], sectionTitle: string}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='pricerate_title'
        text={translate('screens/CompositeSwapScreen', sectionTitle)}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      {priceRates.map((priceRate) => {
        return (
          <TextRow
            key={priceRate.label}
            lhs={priceRate.label}
            rhs={{
              value: priceRate.value,
              testID: 'pricerate_value'
            }}
            textStyle={tailwind('text-sm font-normal')}
          />
        )
      })}
    </>
  )
}
