import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { Text } from './Text'
import { ThemedActivityIndicator } from '@components/themed'

export type ButtonColorType = 'primary' | 'secondary'
export type ButtonFillType = 'fill' | 'outline' | 'flat'

interface ButtonProps extends React.PropsWithChildren<TouchableOpacityProps> {
  color?: ButtonColorType
  fill?: ButtonFillType
  label?: string
  margin?: string
  title?: string
  isSubmitting?: boolean
  submittingLabel?: string
}

export function Button (props: ButtonProps): JSX.Element {
  const {
    label,
    submittingLabel,
    color = 'primary',
    fill = 'fill',
    margin = 'm-4 mt-8',
    isSubmitting = false
  } = props
  const { isLight } = useThemeContext()
  const themedColor = isLight ? `${color}` : `dark${color}`

  const disabledStyle = isLight ? 'bg-gray-200 border-0' : 'bg-gray-600 text-gray-500 border-0'
  const disabledText = isLight ? 'text-gray-400' : 'text-gray-500'

  const buttonColor = isLight ? `bg-${themedColor}-50` : `bg-${themedColor}-700`
  const buttonStyle = `${fill === 'fill' ? buttonColor : 'bg-transparent'}`
  const buttonText = isLight ? `text-${themedColor}-500` : `${fill === 'fill' ? 'text-white' : 'text-primary-700'}`

  const textStyle = `${props.disabled === true ? disabledText : buttonText} ${isSubmitting ? 'ml-2' : ''}`
  const text = isSubmitting ? submittingLabel ?? label : label

  return (
    <TouchableOpacity
      {...props}
      style={tailwind(`${margin} p-3 rounded flex-row justify-center ${buttonStyle} ${props.disabled === true ? disabledStyle : ''}`)}
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
