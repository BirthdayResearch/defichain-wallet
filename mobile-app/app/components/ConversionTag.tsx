import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedIcon, ThemedText, ThemedView } from './themed'

export function ConversionTag (): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-warning-100')}
      dark={tailwind('bg-dfxblue-900')}
      style={tailwind('flex-row rounded p-1.5 self-start mt-2')}
      testID='conversion_tag'
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='swap-vert'
        size={12}
        style={tailwind('mt-0.5 mr-1')}
        dark={tailwind('text-dfxyellow-500')}
      />
      <ThemedText
        light={tailwind('text-dfxgray-500')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('text-xs font-medium')}
      >
        {translate('components/ConversionTag', 'Conversion required')}
      </ThemedText>
    </ThemedView>
  )
}
