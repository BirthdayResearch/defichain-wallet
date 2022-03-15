import { View } from '@components'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'
import { ThemedProps, ThemedText } from '@components/themed'
import { WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { StyleProp, TextProps, ViewProps } from 'react-native'
import NumberFormat from 'react-number-format'
import { BalanceText } from './BalanceText'

interface TokenBreakdownDetailProps {
  hasFetchedToken: boolean
  lockedAmount: BigNumber
  lockedValue: BigNumber
  availableAmount: BigNumber
  availableValue: BigNumber
  dfiUtxo?: WalletToken
  dfiToken?: WalletToken
  testID: string
}

export function TokenBreakdownDetails (props: TokenBreakdownDetailProps): JSX.Element {
  return (
    <>
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_locked`}
        amount={props.lockedAmount.toFixed(8)}
        label='Locked in vault(s)'
        hasFetchedToken={props.hasFetchedToken}
        labelTextStyle={tailwind('font-medium')}
        valueThemeProps={{
          light: tailwind('text-black'),
          dark: tailwind('text-white')
        }}
      />
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_locked_value`}
        amount={props.lockedValue.toFixed(8)}
        label=''
        hasFetchedToken={props.hasFetchedToken}
        valueThemeProps={{
          light: tailwind('text-gray-500'),
          dark: tailwind('text-gray-400')
        }}
        containerStyle={tailwind('mb-2')}
        prefix='≈ $'
      />
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_available`}
        amount={props.availableAmount.toFixed(8)}
        label='Available'
        hasFetchedToken={props.hasFetchedToken}
        labelTextStyle={tailwind('font-medium')}
        valueThemeProps={{
          light: tailwind('text-black'),
          dark: tailwind('text-white')
        }}
      />
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_available_value`}
        amount={props.availableValue.toFixed(8)}
        label=''
        hasFetchedToken={props.hasFetchedToken}
        valueThemeProps={{
          light: tailwind('text-gray-500'),
          dark: tailwind('text-gray-400')
        }}
        prefix='≈ $'
      />
      {props.dfiUtxo !== undefined && props.dfiToken !== undefined &&
        (
          <View style={tailwind('mt-4')}>
            <TokenBreakdownDetailsRow testID='dfi_utxo' amount={props.dfiUtxo.amount} label='as UTXO' hasFetchedToken={props.hasFetchedToken} containerStyle={tailwind('mb-1')} />
            <TokenBreakdownDetailsRow testID='dfi_token' amount={props.dfiToken.amount} label='as Token' hasFetchedToken={props.hasFetchedToken} />
          </View>
        )}
    </>
  )
}

interface TokenBreakdownDetailsRowProps {
  amount: string
  label: string
  testID: string
  hasFetchedToken: boolean
  labelTextStyle?: StyleProp<TextProps>
  valueTextStyle?: StyleProp<TextProps>
  valueThemeProps?: ThemedProps
  containerStyle?: StyleProp<ViewProps>
  prefix?: string
}
function TokenBreakdownDetailsRow ({
  amount,
  label,
  testID,
  hasFetchedToken,
  labelTextStyle,
  valueTextStyle,
  valueThemeProps = {
    light: tailwind('text-gray-500'),
    dark: tailwind('text-gray-400')
  },
  containerStyle,
  prefix
}: TokenBreakdownDetailsRowProps): JSX.Element {
  return (
    <View style={[tailwind('flex-row flex-1 items-center'), containerStyle]}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={[tailwind('pr-14 text-xs'), labelTextStyle]}
        testID={`${testID}_label`}
      >
        {translate('components/DFIBalanceCard', label)}
      </ThemedText>
      <View style={tailwind('flex-row flex-1 justify-end')}>
        {
          hasFetchedToken
            ? (
              <NumberFormat
                value={amount}
                thousandSeparator
                decimalScale={8}
                fixedDecimalScale
                displayType='text'
                prefix={prefix}
                renderText={value =>
                  <BalanceText
                    light={valueThemeProps.light}
                    dark={valueThemeProps.dark}
                    style={[tailwind('text-xs'), valueTextStyle]}
                    testID={`${testID}_amount`}
                    value={value}
                  />}
              />
            )
            : (
              <TextSkeletonLoader
                iContentLoaderProps={{
                  width: '150',
                  height: '14',
                  testID: 'dfi_breakdown_row_skeleton_loader'
                }}
                textHorizontalOffset='30'
                textWidth='120'
              />
            )
        }
      </View>
    </View>
  )
}
