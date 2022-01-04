import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedIcon, ThemedText, ThemedView } from './themed'

export function ConversionTag (): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-warning-100')}
      dark={tailwind('bg-darkwarning-100')}
      style={tailwind('flex-row rounded p-1.5 self-start mt-2')}
      testID='conversion_tag'
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='swap-vert'
        size={12}
        style={tailwind('mt-0.5 mr-1')}
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs font-medium')}
      >
        {translate('components/ConversionTag', 'Conversion required')}
      </ThemedText>
    </ThemedView>
  )
}
