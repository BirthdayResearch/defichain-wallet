import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Text, View } from '.'
import { PrimaryColor } from '../constants/Theme'
import { tailwind } from '../tailwind'

interface StepIndicatorProps {
  current: number
  total?: number
  steps?: string[]
  style?: StyleProp<ViewStyle>
}

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
  if (totalStep < 3 || totalStep > 5 || current <= 0 || current > totalStep) {
    throw Error('Invalid prop for CreateWalletStepIndicator')
  }

  function following (): JSX.Element[] {
    const arr: JSX.Element[] = []
    for (let i = 1; i < totalStep; i++) {
      arr.push(<View style={[tailwind('h-1 flex-grow mt-3.5'), { backgroundColor: current >= i + 1 ? PrimaryColor : '#FFCDEF' }]} />)
      arr.push(<StepNode step={i + 1} isActive={current === i + 1} />)
    }
    return arr
  }

  function descriptions (): JSX.Element[] {
    const arr: JSX.Element[] = []
    for (let i = 0; i < steps.length; i++) {
      const textColor = current === i + 1 ? PrimaryColor : 'gray'
      arr.push(
        <View style={[tailwind('w-16')]}>
          <Text style={[tailwind('text-center'), { color: textColor }]}>{steps[i]}</Text>
        </View>
      )
    }
    return arr
  }

  return (
    <View style={[tailwind('flex-col justify-center items-center w-full'), containerViewStyle]}>
      <View style={[tailwind('flex-row justify-center w-9/12')]}>
        <StepNode step={1} isActive={current === 1} />
        {following()}
      </View>
      <View style={[tailwind('flex-row justify-between w-10/12 mt-2')]}>
        {descriptions()}
      </View>
    </View>
  )
}

function StepNode (props: { step: number, isActive: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex-col')}>
      <View
        style={
          [tailwind('flex-row h-8 w-8 rounded-2xl justify-center items-center'),
            { backgroundColor: props.isActive ? '#FFCDEF' : PrimaryColor }]
        }
      >
        <Text style={{ color: props.isActive ? PrimaryColor : 'white' }}>{props.step}</Text>
      </View>
    </View>
  )
}
