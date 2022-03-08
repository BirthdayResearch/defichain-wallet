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
  usdValueTextStyle,
  testID
}: {
  minNextBidInToken: string
  minNextBidInUSD: string
  displaySymbol: string
  valueTextStyle?: StyleProp<TextStyle>
  usdValueTextStyle?: StyleProp<TextStyle>
  testID?: string
}): {
  MinNextBidInToken: () => JSX.Element
  MinNextBidInUSD: () => JSX.Element
} => {
  const MinNextBidInToken = (): JSX.Element => {
    return (
      <NumberFormat
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
    )
  }

  const MinNextBidInUSD = (): JSX.Element => {
    return (
      <ActiveUSDValue
        price={new BigNumber(minNextBidInUSD)}
        testId={testID !== undefined ? `${testID}_usd` : testID}
        {...(usdValueTextStyle !== undefined && { style: valueTextStyle })}
      />
)
  }

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
  usdValueTextStyle?: StyleProp<TextStyle>
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
  const {
    MinNextBidInToken,
    MinNextBidInUSD
  } = _useMinNextBidTextRowComponent({ ...props })

  return (
    <View style={tailwind('flex flex-row items-center')}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-2xs mr-1')}
      >
        {translate('components/BatchCard', 'Min. next bid is')}
      </ThemedText>
      <View style={tailwind('mr-1')}>
        <MinNextBidInToken />
      </View>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-2xs mr-1')}
      >
        /
      </ThemedText>
      <MinNextBidInUSD />
    </View>
  )
}
