import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { ThemedTextV2, ThemedViewV2 } from './themed'
import { View } from '.'
import { getNativeIcon } from '@components/icons/assets'
import { translate } from '@translations'
import { RandomAvatar } from '@screens/AppNavigator/screens/Portfolio/components/RandomAvatar'

interface ISummaryTitleProps {
  title: string
  amount: BigNumber
  testID: string
  fromAddress: string
  toAddress?: string
  iconA: string
  iconB?: string
}

export function SummaryTitleV2 (props: ISummaryTitleProps): JSX.Element {
  const IconA = getNativeIcon(props.iconA)
  const IconB = props.iconB !== undefined ? getNativeIcon(props.iconB) : undefined

  return (
    <>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-500')}
        light={tailwind('text-mono-light-v2-500')}
        style={tailwind('text-xs font-normal-v2')}
        testID='confirm_title'
      >
        {props.title}
      </ThemedTextV2>

      <View style={tailwind('flex-col')}>
        <View style={tailwind('flex-row items-center mt-2')}>

          {IconB !== undefined
            ? (
              <View style={tailwind('flex-row')}>
                <IconA height={32} width={32} style={tailwind('z-10')} />
                <IconB height={32} width={32} style={tailwind('-ml-3')} />
              </View>
            )
            : (
              <IconA height={32} width={32} />
            )}

          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) => (
              <ThemedTextV2
                style={tailwind('text-3xl font-semibold-v2 flex-wrap pr-1 pl-2')}
                testID={props.testID}
              >
                {value}
              </ThemedTextV2>
            )}
            thousandSeparator
            value={props.amount.toFixed(8)}
          />

        </View>

        <View style={tailwind('flex-row items-center mt-5')}>
          <ThemedTextV2
            style={tailwind('text-xs font-normal-v2')}
            dark={tailwind('text-mono-dark-v2-500')} light={tailwind('text-mono-light-v2-500')}
          >
            {translate('screens/common', 'From')}
          </ThemedTextV2>
          <ThemedViewV2
            dark={tailwind('bg-mono-dark-v2-200')} light={tailwind('bg-mono-light-v2-200')}
            style={tailwind('rounded-full pl-1 pr-2.5 py-1 flex flex-row items-center overflow-hidden ml-2')}
          >
            <RandomAvatar name={props.fromAddress} size={20} />
            <ThemedTextV2
              ellipsizeMode='middle'
              numberOfLines={1}
              style={[tailwind('text-sm font-normal-v2 ml-1'), {
                minWidth: 10,
                maxWidth: 108
              }]}
              testID='wallet_address'
            >
              {props.fromAddress}
            </ThemedTextV2>
          </ThemedViewV2>
        </View>

        {props.toAddress !== undefined && (
          <View style={tailwind('flex-row items-center mt-4')} testID='summary_to_view'>
            <ThemedTextV2
              style={tailwind('text-xs font-normal-v2')}
              dark={tailwind('text-mono-dark-v2-500')} light={tailwind('text-mono-light-v2-500')}
            >
              {translate('screens/common', 'To')}
            </ThemedTextV2>
            <ThemedViewV2
              dark={tailwind('bg-mono-dark-v2-200')} light={tailwind('bg-mono-light-v2-200')}
              style={tailwind('flex flex-row items-center overflow-hidden rounded-full pl-1 pr-2.5 py-1 ml-2')}
            >
              <RandomAvatar name={props.toAddress} size={20} />
              <ThemedTextV2
                ellipsizeMode='middle'
                numberOfLines={1}
                style={[tailwind('text-sm font-normal-v2 ml-1'), {
                  minWidth: 10,
                  maxWidth: 108
                }]}
                testID='summary_to_value'
              >
                {props.toAddress}
              </ThemedTextV2>
            </ThemedViewV2>
          </View>
        )}
      </View>
    </>
  )
}
