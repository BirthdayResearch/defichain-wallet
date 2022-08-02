import { tailwind } from '@tailwind'
import { ThemedActivityIndicatorV2, ThemedIcon, ThemedTextV2, ThemedViewV2 } from './themed'
import { View } from 'react-native'
import { translate } from '@translations'

interface SummaryRowProps {
  title: string
  value: string
  subValue?: string
  testID: string
  valueTextStyle?: string
  containerStyle?: string
  borderType?: BorderType
  converted?: boolean
}

export enum BorderType {
  None,
  Top,
  Bottom
}

export function SummaryRow (props: SummaryRowProps): JSX.Element {
  return (
    <ThemedViewV2
      dark={tailwind('bg-transparent border-mono-dark-v2-300')}
      light={tailwind('bg-transparent border-mono-light-v2-300')}
      style={tailwind('flex-row flex-1 items-start w-full', props.containerStyle, {
        'border-t-0.5': props.borderType === BorderType.Top,
        'border-b-0.5': props.borderType === BorderType.Bottom
      })}
    >
      <View style={tailwind('w-5/12')}>
        <ThemedTextV2
          style={tailwind('font-normal-v2 text-sm mr-1')}
          testID={`${props.testID}_label`}
          dark={tailwind('text-mono-dark-v2-500')} light={tailwind('text-mono-light-v2-500')}
        >
          {props.title}
        </ThemedTextV2>
      </View>

      <View style={tailwind('flex-1 flex-col justify-end')}>
        <ThemedTextV2 style={tailwind('font-normal-v2 text-sm text-right', props.valueTextStyle)}>
          {props.value}
        </ThemedTextV2>
        {props.subValue !== undefined && (
          <ThemedTextV2
            style={tailwind('font-normal-v2 text-sm text-right pt-1')}
            dark={tailwind('text-mono-dark-v2-700')} light={tailwind('text-mono-light-v2-700')}
          >
            {props.subValue}
          </ThemedTextV2>
        )}
        {props.converted !== undefined && (
          <View style={tailwind('flex-row justify-end items-center')}>
            <ThemedTextV2
              style={tailwind('font-normal-v2 text-sm text-right py-1 pr-1')}
              dark={tailwind('text-mono-dark-v2-700')} light={tailwind('text-mono-light-v2-700')}
            >
              {translate('screens/common', props.converted ? 'Converted' : 'Converting')}
            </ThemedTextV2>
            {props.converted
? (
  <ThemedIcon
    iconType='MaterialIcons' name='check-circle' size={20}
    light={tailwind('text-green-v2')} dark={tailwind('text-green-v2')}
  />
            )
: (
  <ThemedActivityIndicatorV2 />
            )}
          </View>
        )}
      </View>
    </ThemedViewV2>
  )
}
