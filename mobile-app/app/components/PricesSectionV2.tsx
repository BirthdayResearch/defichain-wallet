
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { NumberRowV2 } from './NumberRowV2'

export interface PriceRateProps {
  label: string
  value: string
  aSymbol?: string
  bSymbol?: string
  symbolUSDValue?: BigNumber
  hasBorder?: boolean
  usdTextStyle?: { [key: string]: string }
}

export function PricesSectionV2 ({ priceRates, isCompact = false, testID, equalSymbol = true }: { priceRates: PriceRateProps[], testID: string, sectionTitle?: string, isCompact?: boolean, equalSymbol?: boolean }): JSX.Element {
  const rowStyle = {
    lhsThemedProps: {
      light: tailwind('text-mono-light-v2-800'),
      dark: tailwind('text-mono-dark-v2-800')
    },
    rhsThemedProps: {
      light: tailwind('text-mono-light-v2-500'),
      dark: tailwind('text-mono-dark-v2-500')
    }
  }

  return (
    <>
      {
        priceRates.map((priceRate, index) => {
          return (
            <NumberRowV2
              key={priceRate.label}
              rhs={{
                value: priceRate.value,
                testID: `${testID}_${index}`,
                suffix: (priceRate.bSymbol != null) ? ` ${priceRate.bSymbol}` : '',
                usdAmount: priceRate.symbolUSDValue,
                lightTextStyle: rowStyle.lhsThemedProps.light,
                darkTextStyle: rowStyle.lhsThemedProps.dark,
                usdTextStyle: priceRate.usdTextStyle
              }}
              lhs={{
                value: `${priceRate.label}`,
                testID: `${testID}_${index}`,
                suffix: priceRate.bSymbol,
                themedProps: {
                  light: rowStyle.rhsThemedProps.light,
                  dark: rowStyle.rhsThemedProps.dark
                }
              }}
              {...(isCompact && {
                lhsThemedProps: rowStyle.lhsThemedProps,
                rhsThemedProps: rowStyle.rhsThemedProps
              })}
            />
          )
        })
      }
    </>
  )
}
