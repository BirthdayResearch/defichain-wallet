import { View } from '@components'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'

import NumberFormat from 'react-number-format'
import { CollateralizationRatioProps, useCollateralizationRatioColor } from '../hooks/CollateralizationRatio'

interface CollateralizationRatioRowProps extends CollateralizationRatioProps {
  label: string
  value: string
  testId: string
  type: 'current' | 'next'
}

export function CollateralizationRatioRow (props: CollateralizationRatioRowProps): JSX.Element {
  const alertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }
  const nextAlertInfo = {
    title: 'Next collateralization',
    message: 'Next collateralization ratio represents the vault\'s collateralization ratio based on the prices of the collateral/loan token(s) in the next hour.'
  }
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-700')}
      light={tailwind('bg-white border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full border-b')}
    >
      <View style={tailwind('flex-row items-center w-6/12')}>
        <ThemedText
          style={tailwind('text-sm mr-1')}
          testID={`${props.testId}_label`}
        >
          {props.label}
        </ThemedText>
        <BottomSheetInfo
          alertInfo={props.type === 'next' ? nextAlertInfo : alertInfo}
          name={props.type === 'next' ? nextAlertInfo.title : alertInfo.title}
        />
      </View>

      <View
        style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}
      >
        <CollateralizationRatioValue {...props} />
      </View>
    </ThemedView>
  )
}

export function CollateralizationRatioValue (props: CollateralizationRatioProps & { value: string, type: 'current' | 'next', testId: string }): JSX.Element {
  const {
    light,
    dark
  } = useCollateralizationRatioColor({
    colRatio: props.colRatio,
    minColRatio: props.minColRatio,
    totalLoanAmount: props.totalLoanAmount
  })

  return (
    <NumberFormat
      value={props.value}
      decimalScale={2}
      thousandSeparator
      displayType='text'
      suffix='%'
      renderText={(val: string) => (
        <View style={tailwind('flex flex-row items-center flex-1 flex-wrap justify-end')}>
          <ThemedText
            dark={dark}
            light={light}
            style={tailwind('text-sm text-right mr-1')}
            testID={props.testId}
          >
            {props.type === 'next' && '~'}{val}
          </ThemedText>
        </View>
      )}
    />
  )
}
