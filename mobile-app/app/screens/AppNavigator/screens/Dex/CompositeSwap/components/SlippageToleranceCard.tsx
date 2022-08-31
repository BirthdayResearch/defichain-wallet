import { ThemedViewV2, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
// import { useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
// import { WalletTransactionCardTextInput } from '@components/WalletTransactionCardTextInput'

interface SlippageToleranceCardProps {
  maxValue: BigNumber
  onChange: (amount: string, type: SlippageAmountButtonTypes) => void
  status?: TransactionCardStatus
  containerStyle?: StyleProp<ViewStyle>
  amountButtonsStyle?: StyleProp<ViewStyle>
  isCustomSlippage: boolean
}

export enum SlippageAmountButtonTypes {
  ZeroPointFive = '0.5%',
  One = '1%',
  Three = '3%',
  Custom = 'Custom'
}

export enum TransactionCardStatus {
  Default,
  Active,
  Error
}

export function SlippageToleranceCard ({
  maxValue,
  onChange,
  status,
  containerStyle,
  amountButtonsStyle,
  children,
  isCustomSlippage,
}: React.PropsWithChildren<SlippageToleranceCardProps>): JSX.Element {
//   const [isCustomSlippage, setIsCustomSlippage] = useState(false)
// const [isInputFocus, setIsInputFocus] = useState(false)

//   const buildSlippage = (amount: string): string => {
//     return maxValue.multipliedBy(amount).toFixed(8)
//   }
  return (
    <>
      {isCustomSlippage
        ? <>{children}</>
        : (
          <ThemedViewV2
            light={tailwind('bg-mono-light-v2-00', {
                  'border-0.5 border-mono-light-v2-800': status === TransactionCardStatus.Active
                })}
            dark={tailwind('bg-mono-dark-v2-00', {
                  'border-0.5 border-mono-dark-v2-800': status === TransactionCardStatus.Active
                })}
            style={tailwind('rounded-lg-v2', {
                  'border-0.5 border-red-v2': status === TransactionCardStatus.Error
                })}
          >
            <ThemedViewV2
              light={tailwind('border-mono-light-v2-300')}
              dark={tailwind('border-mono-dark-v2-300')}
              style={[tailwind('flex flex-row justify-around items-center py-2.5'), amountButtonsStyle]}
            >
              {
                    Object.values(SlippageAmountButtonTypes).map((type, index, { length }) => {
                      return (
                        <SetAmountButton
                          key={type}
                          amount={maxValue}
                          onPress={onChange}
                          type={type}
                          hasBorder={length - 1 !== index}
                        //   setCustomSlippage={() => setIsCustomSlippage(true)}
                        />
                      )
                    })
                }
            </ThemedViewV2>
          </ThemedViewV2>
        )}
    </>
  )
}

interface SetAmountButtonProps {
  type: SlippageAmountButtonTypes
  onPress: (amount: string, type: SlippageAmountButtonTypes) => void
  amount: BigNumber
  hasBorder?: boolean
}

function SetAmountButton ({
  type,
  onPress,
  amount,
  hasBorder
//   setCustomSlippage
}: SetAmountButtonProps): JSX.Element {
  const decimalPlace = 8
  let value = amount.toFixed(decimalPlace)

  switch (type) {
    case (SlippageAmountButtonTypes.ZeroPointFive):
      value = amount.multipliedBy(0.5).toFixed(decimalPlace)
      break
    case (SlippageAmountButtonTypes.One):
      value = amount.multipliedBy(1).toFixed(decimalPlace)
      break
    case (SlippageAmountButtonTypes.Three):
      value = amount.multipliedBy(3).toFixed(decimalPlace)
      break
    case (SlippageAmountButtonTypes.Custom):
    //   setCustomSlippage()
    //   value = amount.multipliedBy(customAmount ?? 0).toFixed(decimalPlace)
      break
  }

  return (
    <ThemedTouchableOpacityV2
      style={tailwind('border-0')}
      onPress={() => {
        onPress(value, type)
      }}
      testID={`${type}_amount_button`}
    >
      <ThemedViewV2
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-dark-v2-300')}
        style={tailwind({ 'border-r-0.5': hasBorder })}
      >
        <ThemedTextV2
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          style={tailwind('font-semibold-v2 text-xs px-7')}
        >
          {translate('component/max', type)}
        </ThemedTextV2>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  )
}
