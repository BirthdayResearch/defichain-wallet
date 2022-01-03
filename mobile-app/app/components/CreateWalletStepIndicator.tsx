import { StyleProp, ViewStyle } from 'react-native'
import { Text, View } from '.'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedText } from './themed'

interface StepIndicatorProps {
  current: number
  total?: number
  steps?: string[]
  style?: StyleProp<ViewStyle>
}

export const CREATE_STEPS = [
  'Recovery',
  'Verify',
  'Secure'
]

export const RESTORE_STEPS = [
  'Restore',
  'Secure'
]

/**
 * @param props
 * @param {number} props.total throw error if not fulfill (3 < total < 6), optional when props.steps provided
 * @param {number} props.current throw error if not fulfill (0 < current <= total)
 * @param {string[]} props.steps description displayed for each step
 * @returns {JSX.Element}
 */
export function CreateWalletStepIndicator (props: StepIndicatorProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    current,
    total,
    style: containerViewStyle,
    steps = []
  } = props
  if (total === undefined && steps.length === 0) {
    throw Error('Invalid prop for CreateWalletStepIndicator')
  }

  const totalStep = total ?? steps.length
  if (totalStep > 5 || current <= 0 || current > totalStep) {
    throw Error('Invalid prop for CreateWalletStepIndicator')
  }

  function following (): JSX.Element[] {
    const arr: JSX.Element[] = []
    for (let i = 1; i < totalStep; i++) {
      const iconStyle = isLight ? (current >= i + 1 ? 'bg-primary-500' : 'bg-gray-100') : (current >= i + 1 ? 'bg-darkprimary-400' : 'bg-gray-600')
      arr.push(
        <View
          key={i * 2}
          style={tailwind(`h-1 flex-grow mt-3.5 ${iconStyle}`)}
        />)
      arr.push(
        <StepNode
          content={steps[i]}
          current={current}
          isLight={isLight}
          key={i * 2 + 1}
          step={i + 1}
        />)
    }
    return arr
  }

  return (
    <View style={[tailwind('flex-col justify-center items-center w-full'), containerViewStyle]}>
      <View style={tailwind('flex-row justify-center w-9/12 h-14')}>
        <StepNode
          content={steps[0]}
          current={current}
          isLight={isLight}
          step={1}
        />

        {following()}
      </View>
    </View>
  )
}

function getStepNodeStyle (isLight: boolean, current: number, step: number): { stepperStyle: string, textStyle: string } {
  let stepperStyle
  let textStyle
  if (current === step) {
    stepperStyle = isLight ? 'bg-primary-500 bg-opacity-10 border border-primary-500' : 'bg-darkprimary-300 border border-darkprimary-600'
    textStyle = isLight ? 'text-primary-500' : 'text-darkprimary-700'
  } else if (current > step) {
    stepperStyle = isLight ? 'bg-primary-500 border border-primary-500' : 'bg-darkprimary-500 border border-darkprimary-600'
    textStyle = 'text-white'
  } else {
    stepperStyle = isLight ? 'bg-transparent border border-gray-200' : 'bg-gray-700 border border-gray-200'
    textStyle = isLight ? 'text-gray-500' : 'text-gray-400'
  }
  return {
    stepperStyle,
    textStyle
  }
}

function StepNode (props: { step: number, current: number, content: string, isLight: boolean }): JSX.Element {
  const {
    stepperStyle,
    textStyle
  } = getStepNodeStyle(props.isLight, props.current, props.step)
  return (
    <View style={tailwind('flex-col')}>
      <View
        style={tailwind(`h-8 w-8 rounded-2xl justify-center items-center relative ${stepperStyle}`)}
      >
        <Text style={tailwind(`${textStyle} font-medium absolute`)}>
          {props.step}
        </Text>

        <Description
          content={props.content}
          current={props.current}
          step={props.step}
        />
      </View>
    </View>
  )
}

function Description (props: { step: number, current: number, content: string }): JSX.Element {
  return (
    <ThemedText
      dark={tailwind(props.current === props.step ? 'text-darkprimary-400' : 'text-gray-400')}
      light={tailwind(props.current === props.step ? 'text-primary-500' : 'text-gray-500')}
      style={tailwind('text-center text-sm font-medium top-9 absolute w-20')}
    >
      {translate('components/CreateWalletIndicator', props.content)}
    </ThemedText>
  )
}
