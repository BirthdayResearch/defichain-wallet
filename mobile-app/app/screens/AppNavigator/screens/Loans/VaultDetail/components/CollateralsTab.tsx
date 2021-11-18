import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'

interface Collateral {
  id: string
  amount: BigNumber
  tokenUnitPrice: BigNumber
  proportion: BigNumber
}

export function CollateralsTab (): JSX.Element {
  const collaterals: Collateral[] = [
    {
      id: 'DFI',
      amount: new BigNumber(200),
      tokenUnitPrice: new BigNumber('2.54'),
      proportion: new BigNumber('79.5')
    },
    {
      id: 'dETH',
      amount: new BigNumber(0.65),
      tokenUnitPrice: new BigNumber('4530.123'),
      proportion: new BigNumber('20.5')
    }
  ]

  return (
    <View style={tailwind('p-4')}>
      {collaterals.map(collateral => (
        <CollateralCard key={collateral.id} {...collateral} />
      ))}
    </View>
  )
}

function CollateralCard (props: Collateral): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row mb-3 items-center')}>
        <SymbolIcon symbol={props.id} styleProps={{ width: 16, height: 16 }} />
        <ThemedText style={tailwind('ml-1 text-sm font-medium')}>{props.id}</ThemedText>
      </View>
      <View style={tailwind('flex flex-row')}>
        <View style={tailwind('w-8/12')}>
          <CardLabel text='Collateral amount (USD)' />
          <View>
            <NumberFormat
              value={props.amount.toFixed(8)}
              thousandSeparator
              decimalScale={8}
              displayType='text'
              suffix={` ${props.id}`}
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('text-sm')}
                >
                  {val}
                  <NumberFormat
                    value={props.tokenUnitPrice.toFixed(8)}
                    thousandSeparator
                    decimalScale={2}
                    displayType='text'
                    prefix='$'
                    renderText={(val: string) => (
                      <ThemedText
                        dark={tailwind('text-gray-400')}
                        light={tailwind('text-gray-500')}
                        style={tailwind('text-xs')}
                      >
                        {` /${val}`}
                      </ThemedText>
                    )}
                  />
                </ThemedText>
              )}
            />
          </View>
        </View>
        <View style={tailwind('w-4/12 flex items-end')}>
          <CardLabel text='Vault %' />
          <NumberFormat
            value={props.proportion.toFixed(2)}
            thousandSeparator
            decimalScale={2}
            displayType='text'
            suffix=' %'
            renderText={(val: string) => (
              <ThemedText
                dark={tailwind('text-gray-50')}
                light={tailwind('text-gray-900')}
                style={tailwind('text-sm')}
              >
                {val}
              </ThemedText>
            )}
          />
        </View>
      </View>
    </ThemedView>
  )
}

function CardLabel (props: {text: string}): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-500')}
      dark={tailwind('text-gray-400')}
      style={tailwind('text-xs mb-1')}
    >
      {translate('components/VaultDetailsCollateralsTab', props.text)}
    </ThemedText>
  )
}
