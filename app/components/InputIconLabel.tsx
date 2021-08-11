import React from 'react'
import { Text } from './Text'
import { tailwind } from '../tailwind'

interface InputIconLabelProps {
  label: string
}

export function InputIconLabel (props: InputIconLabelProps): JSX.Element {
  return (
    <Text style={tailwind('ml-2 text-gray-500 text-right')}>{getSymbolLabel(props.label)}</Text>
  )
}

function getSymbolLabel (symbol: string): string {
  switch (symbol) {
    case 'DFI':
      return 'DFI (Token)'

    default:
      return symbol
  }
}
