import React from 'react'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from './themed'
import { BottomSheetModal } from './BottomSheetModal'
import { translate } from '@translations'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'

interface FeeInfoRowProps {
  value: string | number
  type: FeeType
  suffix?: string
  testID: string
}

type FeeType = 'ESTIMATED_FEE' | 'VAULT_FEE'

export function FeeInfoRow (props: FeeInfoRowProps): JSX.Element {
  const estimatedFee = {
    title: 'Estimated fee',
    message: 'Each transaction will be subject to a small amount of fees. The amount may vary depending on the network’s congestion.'
  }
  const vaultFee = {
    title: 'Vault fee',
    message: 'This fee serves as initial deposit for your vault. You will receive 1 DFI back when you choose to close this vault.'
  }

  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-5/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText style={tailwind('text-sm mr-1')} testID={`${props.testID}_label`}>
            {translate('components/FeeInfoRow', props.type === 'ESTIMATED_FEE' ? estimatedFee.title : vaultFee.title)}
          </ThemedText>

          <BottomSheetModal
            name='EstimatedFeeInfo'
            snapPoints={['30%']}
            alertInfo={props.type === 'ESTIMATED_FEE' ? estimatedFee : vaultFee}
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
            <View style={tailwind('py-4 px-6 pt-0')}>
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
                  {translate('components/FeeInfoRow', props.type === 'ESTIMATED_FEE' ? estimatedFee.title : vaultFee.title)}
                </ThemedText>

              </View>
              <View testID='estimated_fee_description'>
                <ThemedText
                  style={tailwind('text-base')}
                  dark={tailwind('text-gray-200')}
                  light={tailwind('text-gray-700')}
                >
                  {translate('components/FeeInfoRow', props.type === 'ESTIMATED_FEE' ? estimatedFee.message : vaultFee.message)}
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
              testID={props.testID}
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={props.value}
        />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-sm ml-1')}
          testID={`${props.testID}_suffix`}
        >
          {props.suffix}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
