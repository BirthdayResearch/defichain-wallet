
import { tailwind } from '@tailwind'
import { NumberRow } from '@components/NumberRow'
import { ThemedSectionTitle } from './themed'
import { translate } from '@translations'

export interface PriceRateProps {
  label: string
  value: string
  aSymbol: string
  bSymbol: string
}

export function PricesSection ({ priceRates, sectionTitle, isCompact = false, testID }: { priceRates: PriceRateProps[], testID: string, sectionTitle?: string, isCompact?: boolean }): JSX.Element {
  const rowStyle = {
    lhsThemedProps: {
      light: tailwind('text-gray-500'),
      dark: tailwind('text-dfxgray-400')
    },
    rhsThemedProps: {
      light: tailwind('text-gray-900'),
      dark: tailwind('text-gray-50')
    }
  }

  return (
    <>
      {sectionTitle !== undefined && <ThemedSectionTitle
        testID='pricerate_title'
        text={translate('components/PricesSection', sectionTitle)}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-dfxgray-500 font-medium')}
                                     />}
      {
        priceRates.map((priceRate, index) => {
          return (
            <NumberRow
              key={priceRate.label}
              lhsStyle={tailwind('w-4/12')}
              lhs={priceRate.label}
              rhs={{
                value: priceRate.value,
                testID: `${testID}_${index}`,
                prefix: '≈ ',
                suffix: priceRate.bSymbol,
                suffixType: 'text'
              }}
              textStyle={tailwind('text-sm font-normal')}
              {...(isCompact && {
                lhsThemedProps: rowStyle.lhsThemedProps,
                rhsThemedProps: rowStyle.rhsThemedProps,
                dark: tailwind('bg-dfxblue-800'),
                light: tailwind('bg-white'),
                style: tailwind('py-1 px-4 flex-row items-start w-full')
              })}
            />
          )
        })
      }
    </>
  )
}
