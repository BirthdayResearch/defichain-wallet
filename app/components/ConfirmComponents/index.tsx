import BigNumber from 'bignumber.js'
import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'
import { Button } from '../Button'
import { getNativeIcon } from '../icons/assets'
import { Text } from '../Text'

interface ConfirmTitleItems {
  title: string
  amount: BigNumber
  suffix: string
  testID: string
}

export function ConfirmTitle ({ title, amount, suffix, testID }: ConfirmTitleItems): JSX.Element {
  return (
    <View style={tailwind('flex-col bg-white px-4 py-8 mb-4 justify-center items-center border-b border-gray-300')}>
      <Text testID='confirm_title' style={tailwind('text-xs text-gray-500')}>
        {title}
      </Text>
      <NumberFormat
        value={amount.toFixed(8)} decimalScale={8} thousandSeparator displayType='text' suffix={suffix}
        renderText={(value) => (
          <Text
            testID={testID}
            style={tailwind('text-2xl font-bold flex-wrap')}
          >{value}
          </Text>
        )}
      />
    </View>
  )
}

export function TextRow (props: { lhs: string, rhs: { value: string, testID: string } }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <Text
          testID={props.rhs.testID}
          style={tailwind('font-medium text-right text-gray-500')}
        >{props.rhs.value}
        </Text>
      </View>
    </View>
  )
}

interface NumberRowRightElement {
  value: string | number
  suffix?: string
  testID: string
}

export function NumberRow ({
  lhs,
  rightHandElements
}: { lhs: string, rightHandElements: NumberRowRightElement[] }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{lhs}</Text>
      </View>
      <View style={tailwind('flex-1 flex-col')}>
        {
          rightHandElements.map((rhs, index) => (
            <View key={index} style={tailwind('flex-1')}>
              <NumberFormat
                value={rhs.value} decimalScale={8} thousandSeparator displayType='text'
                suffix={rhs.suffix}
                renderText={(val: string) => (
                  <Text
                    testID={rhs.testID}
                    style={tailwind('flex-wrap font-medium text-right text-gray-500')}
                  >{val}
                  </Text>
                )}
              />
            </View>
          ))
        }
      </View>
    </View>
  )
}

export function TokenBalanceRow (props: { lhs: string, rhs: { value: string | number, testID: string }, iconType: string }): JSX.Element {
  const TokenIcon = getNativeIcon(props.iconType)
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1 flex-row')}>
        <TokenIcon style={tailwind('mr-2')} />
        <Text style={tailwind('font-medium')} testID={`${props.rhs.testID}_unit`}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <NumberFormat
          value={props.rhs.value} decimalScale={8} thousandSeparator displayType='text'
          renderText={(val: string) => (
            <Text
              testID={props.rhs.testID}
              style={tailwind('flex-wrap font-medium text-right text-gray-500')}
            >{val}
            </Text>
          )}
        />
      </View>
    </View>
  )
}

interface SubmitButtonGroupItems {
  isDisabled: boolean
  title: string
  label: string
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function SubmitButtonGroup ({
  isDisabled,
  title,
  label,
  onSubmit,
  onCancel
}: SubmitButtonGroupItems): JSX.Element {
  return (
    <View>
      <Button
        testID={`button_confirm_${title}`}
        disabled={isDisabled}
        label={label}
        title={title} onPress={onSubmit}
      />
      <Button
        testID={`button_cancel_${title}`}
        disabled={isDisabled}
        label={translate('screens/common', 'CANCEL')}
        title='cancel' onPress={onCancel}
        fill='flat'
        margin='m-4 mt-0'
      />
    </View>
  )
}
