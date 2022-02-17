import { View } from '@components'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { ActiveUSDValue } from '../../Loans/VaultDetail/components/ActiveUSDValue'
import BigNumber from 'bignumber.js'
import { StyleProp, TextStyle } from 'react-native'

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

  return (
    <View style={tailwind('flex-row w-full justify-between mb-2')}>
      <View style={tailwind('flex-row mt-0.5')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={[tailwind('text-xs'), props.labelTextStyle]}
        >
          {translate('components/BatchCard', 'Min. next bid')}
        </ThemedText>
        <View style={tailwind('ml-1')}>
          <BottomSheetInfo alertInfo={nextBidInfo} name={nextBidInfo.title} infoIconStyle={[tailwind('text-xs'), props.labelTextStyle]} />
        </View>
      </View>
      <View style={tailwind('flex items-end flex-1')}>
        <NumberFormat
          displayType='text'
          suffix={` ${props.displaySymbol}`}
          renderText={(value: string) => (
            <ThemedText
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
              style={[tailwind('text-sm text-right flex-wrap'), props.valueTextStyle]}
              testID={props.testID}
            >
              {value}
            </ThemedText>
          )}
          thousandSeparator
          value={props.minNextBidInToken}
        />
        <ActiveUSDValue
          price={new BigNumber(props.minNextBidInUSD)}
          testId={props.testID !== undefined ? `${props.testID}_usd` : props.testID}
        />
      </View>
    </View>
  )
}
