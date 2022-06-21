import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { Text } from './Text'
import { ThemedActivityIndicator } from '@components/themed'

export type ButtonFillType = 'fill' | 'outline' | 'flat'

interface ButtonProps extends React.PropsWithChildren<TouchableOpacityProps> {
  fill?: ButtonFillType
  label?: string
  margin?: string
  title?: string
  isSubmitting?: boolean
  submittingLabel?: string
}

export function ButtonV2 (props: ButtonProps): JSX.Element {
  const {
    label,
    submittingLabel,
    fill = 'fill',
    margin = 'm-4 mt-8',
    isSubmitting = false
  } = props
  const { isLight } = useThemeContext()
  const disabledStyle = isLight ? 'bg-gray-200 border-0' : 'bg-gray-600 text-gray-500 border-0'
  const disabledText = isLight ? 'text-gray-400' : 'text-gray-500'

  const buttonColor = isLight ? 'bg-mono-light-v2-900' : 'bg-mono-dark-v2-900'
  const buttonStyle = `${fill === 'fill' ? buttonColor : 'bg-transparent'} rounded-3xl`
  const buttonText = isLight ? `${fill === 'fill' ? 'text-mono-dark-v2-900' : 'text-mono-light-v2-900'} ` : `${fill === 'fill' ? 'text-mono-light-v2-900' : 'text-mono-dark-v2-900'}`

  const textStyle = `${props.disabled === true ? disabledText : buttonText} ${isSubmitting ? 'ml-2' : ''}`
  const text = isSubmitting ? submittingLabel ?? label : label
  return (
    <TouchableOpacity
      {...props}
      style={tailwind(`${margin} p-3.5 rounded flex-row justify-center ${buttonStyle} ${props.disabled === true ? disabledStyle : ''}`)}
    >
      {
        text !== undefined && (
          <>
            {isSubmitting && <ThemedActivityIndicator />}
            <Text style={(tailwind(`${textStyle} font-bold text-center`))}>
              {text}
            </Text>
          </>
        )
      }

      {
        props.children
      }
    </TouchableOpacity>
  )
}
