import { View } from '@components'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { LoanScheme } from '@defichain/whale-api-client/dist/api/loan'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

import NumberFormat from 'react-number-format'

export interface WalletLoanScheme extends LoanScheme {
  disabled?: boolean
}

export function LoanSchemeOptions (props: { loanSchemes: WalletLoanScheme[], selectedLoanScheme?: LoanScheme, onLoanSchemePress: (scheme: LoanScheme) => void }): JSX.Element {
  return (
    <View
      style={tailwind('mb-1')}
      testID='loan_scheme_options'
    >
      {props.loanSchemes.map((scheme, index) => (
        <ThemedTouchableOpacity
          key={scheme.id}
          light={tailwind('bg-white border-dfxgray-300', {
            'border-primary-500': props.selectedLoanScheme?.id === scheme.id,
            'border-gray-50': scheme.disabled === true
          })}
          dark={tailwind('bg-dfxblue-800 border-dfxblue-900', {
            'border-dfxred-500': props.selectedLoanScheme?.id === scheme.id,
            'border-dfxgray-500': scheme.disabled === true
          })}
          style={tailwind('py-2 px-5 rounded-lg border flex flex-row items-center mb-1')}
          onPress={() => props.onLoanSchemePress(scheme)}
          disabled={scheme.disabled}
          testID={`loan_scheme_option_${index}`}
        >
          <ThemedView
            light={tailwind('border-dfxgray-500', {
              'border-primary-500 bg-primary-500': props.selectedLoanScheme?.id === scheme.id,
              'border-gray-100 bg-gray-50': scheme.disabled === true
            })}
            dark={tailwind('border-dfxgray-400', {
              'border-dfxred-500 bg-dfxred-500': props.selectedLoanScheme?.id === scheme.id,
              'border-dfxgray-500 bg-dfxgray-500': scheme.disabled === true
            })}
            style={tailwind('rounded-full border w-4 h-4 mr-7')}
          >
            {props.selectedLoanScheme?.id === scheme.id &&
            (
              <ThemedIcon
                iconType='MaterialIcons'
                name='check'
                size={14}
                light={tailwind('text-white')}
                dark={tailwind('text-black')}
              />
            )}

          </ThemedView>
          <LoanSchemeOptionData
            label='Min. collateralization ratio'
            value={scheme.minColRatio}
            testId={`min_col_ratio_value_${index}`}
            suffix='%'
            disabled={scheme.disabled}
          />
          <LoanSchemeOptionData
            label='Interest rate'
            value={scheme.interestRate}
            testId={`interest_rate_value_${index}`}
            suffix={`% ${translate('components/LoanSchemeOptions', 'APR')}`}
            disabled={scheme.disabled}
          />
        </ThemedTouchableOpacity>
      ))}
    </View>
  )
}

function LoanSchemeOptionData (props: { label: string, value: string, testId: string, suffix?: string, disabled?: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex-1')}>
      <ThemedText
        light={tailwind('text-dfxgray-400', { 'text-dfxgray-300': props.disabled === true })}
        dark={tailwind('text-dfxgray-500', { 'text-dfxgray-500': props.disabled === true })}
        style={tailwind('text-xs')}
      >
        {translate('components/LoanSchemeOptions', props.label)}
      </ThemedText>
      <NumberFormat
        displayType='text'
        suffix={props.suffix}
        renderText={(value: string) => (
          <ThemedText
            light={tailwind('text-gray-900', { 'text-dfxgray-300': props.disabled === true })}
            dark={tailwind('text-dfxgray-300', { 'text-dfxgray-500': props.disabled === true })}
            style={tailwind('text-sm font-medium')}
            testID={props.testId}
          >
            {value}
          </ThemedText>
        )}
        thousandSeparator
        value={props.value}
      />

    </View>
  )
}
