import { ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { StyleProp, ViewStyle } from 'react-native'
import { PricesSectionV2, PriceRateProps } from '@components/PricesSectionV2'
import { NumberRowV2, NumberRowElement, RhsNumberRowElement } from '@components/NumberRowV2'

interface LiquidityCalculationSummaryProps {
    priceRatesOption: PriceRateProps[]
    resultingLplhs: NumberRowElement
    resultingLprhs: RhsNumberRowElement
    containerStyle?: StyleProp<ViewStyle>
}

export function LiquidityCalculationSummary ({ priceRatesOption, resultingLplhs, resultingLprhs, containerStyle }: LiquidityCalculationSummaryProps): JSX.Element {
    return (
      <>
        <ThemedViewV2
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
          style={containerStyle}
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
              lhs={resultingLplhs}
              rhs={resultingLprhs}
            />
          </ThemedViewV2>
        </ThemedViewV2>
      </>
    )
}
