import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { Text } from './Text'

export type ButtonFillType = 'fill' | 'outline' | 'flat'

interface ButtonProps extends React.PropsWithChildren<TouchableOpacityProps> {
  fill?: ButtonFillType
  label?: string
  styleProps?: string
}

export function ButtonV2 (props: ButtonProps): JSX.Element {
  const {
    label,
    fill = 'fill',
    styleProps = 'm-4 mt-8'
  } = props
  const { isLight } = useThemeContext()
  const disabledStyle = isLight ? 'bg-mono-dark-v2-500' : 'bg-mono-light-v2-500'
  const disabledText = isLight ? 'text-mono-dark-v2-900' : 'text-mono-light-v2-900'

  const buttonColor = isLight ? 'bg-mono-light-v2-900' : 'bg-mono-dark-v2-900'
  const buttonStyle = `${fill === 'fill' ? buttonColor : 'bg-transparent'}`
  const buttonText = isLight ? `${fill === 'fill' ? 'text-mono-dark-v2-900' : 'text-mono-light-v2-900'} ` : `${fill === 'fill' ? 'text-mono-light-v2-900' : 'text-mono-dark-v2-900'}`

  const textStyle = `${props.disabled === true ? disabledText : buttonText}`
  return (
    <TouchableOpacity
      {...props}
      style={[tailwind(`${styleProps} p-3.5 flex-row justify-center ${buttonStyle} ${props.disabled === true ? disabledStyle : ''}`), { borderRadius: 26 }]}
      activeOpacity={0.7}
    >
      <>
        <Text style={(tailwind(`${textStyle} font-semibold-v2 text-center`))}>
          {label}
        </Text>
      </>
    </TouchableOpacity>
  )
}
