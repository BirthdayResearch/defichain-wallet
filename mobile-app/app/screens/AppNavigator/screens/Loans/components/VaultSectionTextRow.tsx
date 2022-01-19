import { BottomSheetAlertInfo } from '@components/BottomSheetInfo'
import { NumberRow, NumberRowElement } from '@components/NumberRow'
import { ThemedProps } from '@components/themed'
import { tailwind } from '@tailwind'

import { ViewProps } from 'react-native'

type IVaultSectionTextProps = React.PropsWithChildren<ViewProps> & VaultSectionTextProps
interface VaultSectionTextProps extends NumberRowElement {
  lhs: string
  info?: BottomSheetAlertInfo
  rhsThemedProps?: ThemedProps
}

export function VaultSectionTextRow (props: IVaultSectionTextProps): JSX.Element {
  return (
    <NumberRow
      lhs={props.lhs}
      rhs={{
        value: props.value,
        testID: props.testID,
        suffix: props.suffix,
        suffixType: props.suffixType,
        prefix: props.prefix,
        style: props.style
      }}
      info={props.info}
      style={tailwind('flex-row w-full my-1')}
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      textStyle={tailwind('text-xs ml-0')}
      lhsThemedProps={{
        light: tailwind('text-gray-500'),
        dark: tailwind('text-gray-400')
      }}
      rhsThemedProps={{
        light: tailwind('text-gray-900'),
        dark: tailwind('text-gray-50'),
        ...props.rhsThemedProps
      }}
    >
      {props.children}
    </NumberRow>
  )
}
