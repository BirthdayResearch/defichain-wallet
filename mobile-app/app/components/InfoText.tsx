import { tailwind } from '@tailwind'
import { TextProps } from '.'
import { ThemedIcon, ThemedProps, ThemedText, ThemedView } from './themed'

interface InfoTextProp extends ThemedProps, TextProps {
  text: string
  type?: InfoTextType
  simple?: boolean
}

export type InfoTextType = 'warning' | 'error' | 'success'

export function InfoText (props: InfoTextProp): JSX.Element {
  const {
    simple,
    type = 'warning',
    style,
    light = tailwind({ 'bg-warning-50 border-warning-200': type === 'warning', 'bg-error-50 border-error-200': type === 'error', 'bg-success-50 border-success-200': type === 'success' }),
    dark = tailwind((simple ?? false) ? '' : 'bg-dfxblue-900 border-dfxblue-800'),
    ...otherProps
  } = props

  return (
    <ThemedView
      style={[
        style
      ].concat((simple ?? false) ? [] : [tailwind('rounded p-2 flex-row border')]
      )}
      light={light}
      dark={dark}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name={type === 'success' ? 'check-circle-outline' : type === 'warning' ? 'info' : 'warning'}
        size={14}
        light={tailwind({ 'text-warning-500': type === 'warning', 'text-error-500': type === 'error', 'text-success-500': type === 'success' })}
        dark={tailwind({ 'text-dfxyellow-500': type === 'warning', 'text-darkerror-500': type === 'error', 'text-dfxgreen-500': type === 'success' })}
      />
      <ThemedText
        style={tailwind('text-xs pl-2 font-medium', simple ?? 'flex-1')}
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        {...otherProps}
      >
        {props.text}
      </ThemedText>
    </ThemedView>
  )
}
