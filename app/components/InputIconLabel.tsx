import React from 'react'
import { Text } from './Text'
import { tailwind } from '../tailwind'

export enum IconLabelScreenType {
  Balance,
  DEX
}
interface InputIconLabelProps {
  testID?: string
  label: string
  screenType: IconLabelScreenType
}

export function InputIconLabel (props: InputIconLabelProps): JSX.Element {
  return (
    <Text testID={props.testID} style={tailwind('ml-2 text-gray-500 text-right')}>{getSymbolLabel(props.label, props.screenType)}</Text>
  )
}

function getSymbolLabel (symbol: string, screenType: IconLabelScreenType): string {
  let symbolLabel: string

  switch (symbol) {
    case 'DFI':
      symbolLabel = screenType === IconLabelScreenType.Balance ? 'DFI (UTXO)' : 'DFI (Token)'
      break

    default:
      symbolLabel = symbol
  }

  return symbolLabel
}
