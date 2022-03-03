import { View } from '@components'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { ActiveUSDValue } from '../../Loans/VaultDetail/components/ActiveUSDValue'
import BigNumber from 'bignumber.js'
import { StyleProp, TextStyle } from 'react-native'

const _useMinNextBidTextRowComponent = ({
  minNextBidInToken,
  minNextBidInUSD,
  displaySymbol,
  valueTextStyle,
  testID
}: {
  minNextBidInToken: string
  minNextBidInUSD: string
  displaySymbol: string
  valueTextStyle?: StyleProp<TextStyle>
  testID?: string
}): {
  MinNextBidInToken: () => JSX.Element
  MinNextBidInUSD: () => JSX.Element
} => {
  const MinNextBidInToken = (): JSX.Element => <NumberFormat
    displayType='text'
    suffix={` ${displaySymbol}`}
    renderText={(value: string) => (
      <ThemedText
        light={tailwind('text-gray-900')}
        dark={tailwind('text-gray-50')}
        style={[tailwind('text-sm text-right flex-wrap'), valueTextStyle]}
        testID={testID}
      >
        {value}
      </ThemedText>
    )}
    thousandSeparator
    value={minNextBidInToken}
                                               />

  const MinNextBidInUSD = (): JSX.Element => <ActiveUSDValue
    price={new BigNumber(minNextBidInUSD)}
    testId={testID !== undefined ? `${testID}_usd` : testID}
                                             />

  return {
    MinNextBidInToken,
    MinNextBidInUSD
  }
}

interface MinNextBidTextRowProps {
  minNextBidInToken: string
  minNextBidInUSD: string
  displaySymbol: string
  labelTextStyle?: StyleProp<TextStyle>
  valueTextStyle?: StyleProp<TextStyle>
  testID?: string
}

export function MinNextBidTextRow (props: MinNextBidTextRowProps): JSX.Element {
  const nextBidInfo = {
    title: 'Min. next bid',
    message: 'The minimum bid a user must place in order to take part in the auction.'
  }
  const { labelTextStyle, ...otherProps } = props
  const {
    MinNextBidInToken,
    MinNextBidInUSD
  } = _useMinNextBidTextRowComponent({ ...otherProps })

  return (
    <View style={tailwind('flex-row w-full justify-between mb-2')}>
      <View style={tailwind('flex-row mt-0.5')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={[tailwind('text-xs'), labelTextStyle]}
        >
          {translate('components/BatchCard', 'Min. next bid')}
        </ThemedText>
        <View style={tailwind('ml-1')}>
          <BottomSheetInfo alertInfo={nextBidInfo} name={nextBidInfo.title} infoIconStyle={[tailwind('text-xs'), props.labelTextStyle]} />
        </View>
      </View>
      <View style={tailwind('flex items-end flex-1')}>
        <MinNextBidInToken />
        <MinNextBidInUSD />
      </View>
    </View>
  )
}

export function MinNextBidTextCompact (props: MinNextBidTextRowProps): JSX.Element {
  const { labelTextStyle, ...otherProps } = props
  const {
    MinNextBidInToken,
    MinNextBidInUSD
  } = _useMinNextBidTextRowComponent({ ...otherProps })

  return (
    <View style={tailwind('flex flex-row items-end')}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={[tailwind('text-xs mr-1'), labelTextStyle]}
      >
        {translate('components/BatchCard', 'Min. next bid is')}
      </ThemedText>
      <View style={tailwind('mr-1')}>
        <MinNextBidInToken />
      </View>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={[tailwind('text-xs mr-1'), labelTextStyle]}
      >
        /
      </ThemedText>
      <MinNextBidInUSD />
    </View>
  )
}
