import BigNumber from 'bignumber.js'

import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { ThemedText } from './themed'
import { View } from '.'
import { ViewProps } from 'react-native'

type SummaryTitleProps = React.PropsWithChildren<ViewProps> & ISummaryTitleProps
type SuffixType = 'text' | 'component'

interface ISummaryTitleProps {
  title: string
  amount: BigNumber
  suffixType: SuffixType
  suffix?: string
  testID: string
}

export function SummaryTitle (props: SummaryTitleProps): JSX.Element {
  return (
    <>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-sm')}
        testID='confirm_title'
      >
        {props.title}
      </ThemedText>

      <View style={tailwind('flex-row items-center')}>
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              style={tailwind('text-2xl font-bold flex-wrap pr-1')}
              testID={props.testID}
            >
              {value}
            </ThemedText>
          )}
          thousandSeparator
          value={props.amount.toFixed(8)}
        />

        {props.suffixType === 'text' &&
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-sm')}
            testID={`${props.testID}_suffix`}
          >
            {props.suffix}
          </ThemedText>}

        {
          props.suffixType === 'component' &&
          (props.children)
        }

      </View>
    </>
  )
}
