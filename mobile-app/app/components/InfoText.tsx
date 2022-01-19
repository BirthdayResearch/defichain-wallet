import { tailwind } from '@tailwind'
import { TextProps } from '.'
import { ThemedIcon, ThemedProps, ThemedText, ThemedView } from './themed'

interface InfoTextProp extends ThemedProps, TextProps {
  text: string
  type?: InfoTextType
}

export type InfoTextType = 'warning' | 'error' | 'success'

export function InfoText (props: InfoTextProp): JSX.Element {
  const {
    type = 'warning',
    style,
    light = tailwind({ 'bg-warning-50 border-warning-200': type === 'warning', 'bg-error-50 border-error-200': type === 'error', 'bg-success-50 border-success-200': type === 'success' }),
    dark = tailwind({ 'bg-darkwarning-50 border-darkwarning-200': type === 'warning', 'bg-darkerror-50 border-darkerror-200': type === 'error', 'bg-success-50 border-success-200': type === 'success' }),
    ...otherProps
  } = props

  return (
    <ThemedView
      style={[
        tailwind('rounded p-2 flex-row border'),
        style
      ]}
      light={light}
      dark={dark}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name={type === 'success' ? 'check-circle-outline' : type === 'warning' ? 'info' : 'warning'}
        size={14}
        light={tailwind({ 'text-warning-500': type === 'warning', 'text-error-500': type === 'error', 'text-success-500': type === 'success' })}
        dark={tailwind({ 'text-darkwarning-500': type === 'warning', 'text-darkerror-500': type === 'error', 'text-darksuccess-500': type === 'success' })}
      />
      <ThemedText
        style={tailwind('text-xs pl-2 font-medium flex-1')}
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        {...otherProps}
      >
        {props.text}
      </ThemedText>
    </ThemedView>
  )
}
