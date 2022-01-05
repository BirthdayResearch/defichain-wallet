import { tailwind } from '@tailwind'
import { ThemedText } from './themed'

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
    <ThemedText
      dark={tailwind('text-gray-400')}
      light={tailwind('text-gray-500')}
      style={tailwind('ml-2 text-right')}
      testID={props.testID}
    >
      {getSymbolLabel(props.label, props.screenType)}
    </ThemedText>
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
