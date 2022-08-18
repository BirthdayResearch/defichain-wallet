import { ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { PricesSectionV2, PriceRateProps } from '@components/PricesSectionV2'
import { NumberRowV2, NumberRowElement, RhsNumberRowElement } from '@components/NumberRowV2'

export function LiquidityCalculationSummary ({ priceRatesOption, lplhs, lprhs }: {priceRatesOption: PriceRateProps[], lplhs: NumberRowElement, lprhs: RhsNumberRowElement}): JSX.Element {
    return (
      <>
        <ThemedViewV2
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
          style={tailwind('pt-5 px-5 border rounded-lg-v2')}
        >
          <PricesSectionV2
            key='prices'
            testID='pricerate_value'
            priceRates={priceRatesOption}
          />
          <ThemedViewV2
            light={tailwind('border-mono-light-v2-300')}
            dark={tailwind('border-mono-dark-v2-300')}
            style={tailwind('pt-5 border-t-0.5')}
          >
            <NumberRowV2
              lhs={lplhs}
              rhs={lprhs}
            />
          </ThemedViewV2>
        </ThemedViewV2>
      </>
    )
}
