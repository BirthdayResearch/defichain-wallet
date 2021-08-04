import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Text, View } from '.'
import { tailwind } from '../tailwind'
import { translate } from '../translations'

interface StepIndicatorProps {
  current: number
  total?: number
  steps?: string[]
  style?: StyleProp<ViewStyle>
}

export const CREATE_STEPS = [
  translate('components/CreateWalletIndicator', 'recovery'),
  translate('components/CreateWalletIndicator', 'verify'),
  translate('components/CreateWalletIndicator', 'passcode')
]

export const RESTORE_STEPS = [
  translate('components/CreateWalletIndicator', 'restore'),
  translate('components/CreateWalletIndicator', 'passcode')
]

/**
 * @param props
 * @param {number} props.total throw error if not fulfill (3 < total < 6), optional when props.steps provided
 * @param {number} props.current throw error if not fulfill (0 < current <= total)
 * @param {string[]} props.steps description displayed for each step
 * @returns {JSX.Element}
 */
export function CreateWalletStepIndicator (props: StepIndicatorProps): JSX.Element {
  const { current, total, style: containerViewStyle, steps = [] } = props
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
      const iconStyle = current >= i + 1 ? 'bg-primary' : 'bg-gray-100'
      arr.push(
        <View
          key={i * 2}
          style={tailwind(`h-1 flex-grow mt-3.5 ${iconStyle}`)}
        />)
      arr.push(<StepNode key={i * 2 + 1} step={i + 1} current={current} />)
    }
    return arr
  }

  function descriptions (): JSX.Element[] {
    const arr: JSX.Element[] = []
    for (let i = 0; i < steps.length; i++) {
      let textStyle = ''
      if (current === i + 1) {
        textStyle = 'text-primary'
      } else {
        textStyle = 'text-gray-500'
      }
      arr.push(
        <View key={i}>
          <Text style={tailwind(`text-center text-sm font-medium ${textStyle}`)}>{steps[i]}</Text>
        </View>
      )
    }
    return arr
  }

  return (
    <View style={[tailwind('flex-col justify-center items-center w-full'), containerViewStyle]}>
      <View style={[tailwind('flex-row justify-center w-9/12')]}>
        <StepNode step={1} current={current} />
        {following()}
      </View>
      <View style={[tailwind('flex-row justify-between w-10/12 mt-1 font-medium')]}>
        {descriptions()}
      </View>
    </View>
  )
}

function StepNode (props: { step: number, current: number }): JSX.Element {
  let stepperStyle
  let textStyle
  if (props.current === props.step) {
    stepperStyle = 'bg-primary bg-opacity-10 border border-primary'
    textStyle = 'text-primary'
  } else if (props.current > props.step) {
    stepperStyle = 'bg-primary border border-primary'
    textStyle = 'text-white'
  } else {
    stepperStyle = 'bg-transparent border border-gray-200'
    textStyle = 'text-gray-500'
  }
  return (
    <View style={tailwind('flex-col')}>
      <View
        style={tailwind(`h-8 w-8 rounded-2xl justify-center items-center ${stepperStyle}`)}
      >
        <Text style={tailwind(`${textStyle} font-medium`)}>{props.step}</Text>
      </View>
    </View>
  )
}
