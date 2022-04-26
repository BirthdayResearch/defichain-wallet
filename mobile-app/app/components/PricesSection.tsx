
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedSectionTitle } from '@components/themed'
import { NumberRow } from '@components/NumberRow'

export interface PriceRateProps { label: string, value: string, aSymbol: string, bSymbol: string }

export function PricesSection ({ priceRates, sectionTitle, testID }: {priceRates: PriceRateProps[], sectionTitle: string, testID: string}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='pricerate_title'
        text={translate('components/PricesSection', sectionTitle)}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      {priceRates.map((priceRate, index) => {
        return (
          <NumberRow
            key={priceRate.label}
            lhs={priceRate.label}
            rhs={{
              value: priceRate.value,
              testID: `${testID}_${index}`,
              prefix: `1 ${priceRate.aSymbol} = `,
              suffix: priceRate.bSymbol,
              suffixType: 'text'
            }}
            textStyle={tailwind('text-sm font-normal')}
          />
        )
      })}
    </>
  )
}
