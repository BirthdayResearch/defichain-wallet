import { StyleProp, ViewStyle } from 'react-native'
import { Text, View } from '.'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedIcon, ThemedText } from './themed'

interface StepIndicatorProps {
  current: number
  total?: number
  steps?: string[]
  style?: StyleProp<ViewStyle>
}

export const CREATE_STEPS = [
  'RECOVERY',
  'VERIFY',
  'SECURE'
]

export const RESTORE_STEPS = [
  'RESTORE',
  'SECURE'
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
      const lineStyle = current >= i + 1 ? 'bg-green-v2' : isLight ? 'bg-mono-light-v2-900' : 'bg-mono-dark-v2-900'
      arr.push(
        <View
          key={i * 2}
          style={tailwind(`h-px flex-grow mt-4 ${lineStyle}`)}
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
      <View style={tailwind('flex-row justify-center w-9/12 h-16')}>
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
    stepperStyle = 'border border-green-v2'
    textStyle = 'text-green-v2'
  } else if (current > step) {
    stepperStyle = 'border bg-green-v2 border-green-v2'
    textStyle = 'text-green-v2'
  } else {
    stepperStyle = isLight ? 'border border-mono-light-v2-900' : 'border border-mono-dark-v2-900'
    textStyle = isLight ? 'text-mono-light-v2-900' : 'text-mono-dark-v2-900'
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
        style={tailwind(`h-9 w-9 rounded-full justify-center items-center relative ${stepperStyle}`)}
      >
        {props.current > props.step
        ? <ThemedIcon
            size={18}
            name='check'
            iconType='Feather'
            dark={tailwind('text-mono-dark-v2-00')}
            light={tailwind('text-mono-light-v2-00')}
          />
        : (
          <Text style={tailwind(`${textStyle} font-semibold text-lg absolute`)}>
            {props.step}
          </Text>
        )}
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
      dark={tailwind(props.current === props.step ? 'text-green-v2' : 'text-mono-dark-v2-900')}
      light={tailwind(props.current === props.step ? 'text-green-v2' : 'text-mono-light-v2-900')}
      style={tailwind('text-center text-xs font-normal top-12 absolute w-20')}
    >
      {translate('components/CreateWalletIndicator', props.content)}
    </ThemedText>
  )
}
