import React from 'react'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from './themed'
import { BottomSheetModal } from './BottomSheetModal'
import { translate } from '@translations'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'

interface EstimatedFeeElement {
  value: string | number
  suffix?: string
  testID: string
}

export function EstimatedFeeInfo ({
  lhs,
  rhs
}: { lhs: string, rhs: EstimatedFeeElement }): JSX.Element {
  const feeInfo = {
    title: translate('screens/EstimatedFeeInfo', 'Estimated Fee'),
    message: translate('screens/EstimatedFeeInfo', 'Each transaction will subject to a small amount of fees. The amount may vary depending on the network’s congestion.')
  }

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('py-4 px-6 flex-row items-start w-full')}
    >
      <View style={tailwind('w-5/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText style={tailwind('text-sm mr-1')} testID={`${rhs.testID}_label`}>
            {lhs}
          </ThemedText>

          <BottomSheetModal
            name='EstimatedFeeInfo'
            snapPoints={['30%']}
            alertInfo={feeInfo}
            triggerComponent={
              <ThemedIcon
                size={16}
                name='info-outline'
                iconType='MaterialIcons'
                dark={tailwind('text-gray-200')}
                light={tailwind('text-gray-700')}
              />
          }
          >
            <View style={tailwind('p-4 pt-0')}>
              <View
                testID='estimated_fee_heading'
                style={tailwind('flex-row mb-3 items-center')}
              >
                <ThemedIcon
                  size={20}
                  name='info-outline'
                  iconType='MaterialIcons'
                  dark={tailwind('text-gray-200')}
                  light={tailwind('text-gray-700')}
                />
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('ml-2 text-2xl font-semibold')}
                >
                  {feeInfo.title}
                </ThemedText>

              </View>
              <View testID='estimated_fee_description'>
                <ThemedText
                  style={tailwind('text-base')}
                  dark={tailwind('text-gray-200')}
                  light={tailwind('text-gray-700')}
                >
                  {feeInfo.message}
                </ThemedText>
              </View>
            </View>
          </BottomSheetModal>
        </View>
      </View>

      <View style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}>
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind('text-gray-400')}
              light={tailwind('text-gray-500')}
              style={tailwind('text-sm text-right')}
              testID={rhs.testID}
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={rhs.value}
        />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-sm ml-1')}
          testID={`${rhs.testID}_suffix`}
        >
          {rhs.suffix}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
