import { Platform, StyleProp, ViewStyle } from 'react-native'
import { Text, View } from '.'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedIcon, ThemedTextV2 } from './themed'

interface StepIndicatorProps {
  current: number
  total?: number
  steps?: string[]
  style?: StyleProp<ViewStyle>
  isComplete?: boolean
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
export function CreateWalletStepIndicatorV2 (props: StepIndicatorProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    current,
    total,
    style: containerViewStyle,
    steps = [],
    isComplete
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
          isComplete={isComplete}
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
          isComplete={isComplete}
        />
        {following()}
      </View>
    </View>
  )
}

function getStepNodeStyle (isLight: boolean, current: number, step: number, isComplete?: boolean): { stepperStyle: string, textStyle: string } {
  let stepperStyle = isLight ? 'border border-mono-light-v2-900' : 'border border-mono-dark-v2-900'
  let textStyle = isLight ? 'text-mono-light-v2-900' : 'text-mono-dark-v2-900'
  if (isComplete !== undefined && current === step) {
    stepperStyle = 'border border-green-v2'
    textStyle = 'text-green-v2'
  } else if (isComplete ?? current > step) {
    stepperStyle = 'border bg-green-v2 border-green-v2'
    textStyle = 'text-green-v2'
  }
  return {
    stepperStyle,
    textStyle
  }
}

function StepNode (props: { step: number, current: number, content: string, isLight: boolean, isComplete?: boolean }): JSX.Element {
  const {
    stepperStyle,
    textStyle
  } = getStepNodeStyle(props.isLight, props.current, props.step, props.isComplete)
  return (
    <View style={tailwind('flex-col')}>
      <View
        style={tailwind(`h-9 w-9 rounded-full justify-center items-center relative ${stepperStyle}`)}
      >
        {props.isComplete ?? props.current > props.step
          ? <ThemedIcon
              size={18}
              name='check'
              iconType='Feather'
              dark={tailwind('text-mono-dark-v2-00')}
              light={tailwind('text-mono-light-v2-00')}
            />
          : (
            <Text
              style={tailwind([`${textStyle} font-semibold-v2 text-lg`, { '-mt-1.5': Platform.OS === 'android' }])}
            >
              {props.step}
            </Text>
          )}
        <Description
          content={props.content}
          textStyle={textStyle}
        />
      </View>
    </View>
  )
}

function Description (props: {content: string, textStyle: string }): JSX.Element {
  return (
    <ThemedTextV2
      dark={tailwind(props.textStyle)}
      light={tailwind(props.textStyle)}
      style={tailwind('text-center text-xs font-normal-v2 top-12 absolute w-20')}
    >
      {translate('components/CreateWalletIndicator', props.content)}
    </ThemedTextV2>
  )
}
