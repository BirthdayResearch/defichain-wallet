import { View } from '@components'
import { tailwind } from '@tailwind'
import React from 'react'
import { SvgProps } from 'react-native-svg'
import { getNativeIcon } from './icons/assets'
import BigNumber from 'bignumber.js'
import { ThemedText } from './themed'

export function TokenIconGroup (props: {symbols: string[]}): JSX.Element {
  const additionalIcon = BigNumber.max(props.symbols.length - 3, 0)
  return (
    <View style={tailwind('flex flex-row mx-1')}>
      {
        props.symbols.map((symbol, index) => {
          if (index <= 2) {
            return (
              <SymbolIcon
                key={index.toString()}
                symbol={symbol}
                styleProps={{
                  style: [
                    tailwind('relative'),
                    {
                      left: index * 8
                    }
                  ]
                }}
              />
            )
          } else {
            return (<></>)
          }
        })
      }
      {additionalIcon.gt(0) &&
        (
          <ThemedText>
            + {additionalIcon.toFixed()}
          </ThemedText>
        )}
    </View>

  )
}

function SymbolIcon (props: {symbol: string, styleProps?: SvgProps}): JSX.Element {
  const Icon = getNativeIcon(props.symbol)
  return (
    <Icon width={16} height={16} {...props.styleProps} />
  )
}
