import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { View } from '@components'
import { BottomSheetSlippageTolerance } from './BottomSheetSlippageTolerance'
import { BottomSheetNavScreen } from '@components/BottomSheetWithNav'

const SLIPPAGE_MODAL_NAME = 'SlippageTolerance'
const percentageList = ['1', '3', '5', '10', '20']

interface SlippageToleranceProps {
  slippage: BigNumber
  setSlippage: (slippage: BigNumber) => void
  setIsSelectorOpen: (val: boolean) => void
  setBottomSheetScreen: (screens: BottomSheetNavScreen[]) => void
  onPress: () => void
  onCloseButtonPress: () => void
}

export function SlippageTolerance ({ slippage, setSlippage, setIsSelectorOpen, setBottomSheetScreen, onPress, onCloseButtonPress }: SlippageToleranceProps): JSX.Element {
  const { dismiss } = useBottomSheetModal()
  const [isCustomSlippage, setIsCustomSlippage] = useState(false)
  const onSubmitSlippage = (val: BigNumber, isCustom: boolean): void => {
    setIsCustomSlippage(isCustom)
    setSlippage(val)
    setIsSelectorOpen(false)
    dismiss(SLIPPAGE_MODAL_NAME)
  }

  const setSlippageToleranceToBottomSheet = useCallback(() => {
    setBottomSheetScreen([
      {
        stackScreenName: 'BottomSheetSlippageTolerance',
        component: BottomSheetSlippageTolerance({
          slippage,
          isCustomSlippage,
          onSubmitSlippage,
          onCloseButtonPress
        }),
        option: {
          header: () => null
        }
      }])
  }, [slippage, isCustomSlippage])

  useEffect(() => {
    setIsCustomSlippage(!percentageList.includes(new BigNumber(slippage).toString()))
  }, [slippage])

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex-row items-center w-full')}
    >
      <View style={tailwind('w-full')}>
        <TouchableOpacity
          onPress={() => {
            setIsSelectorOpen(true)
            setSlippageToleranceToBottomSheet()
            onPress()
          }}
          style={tailwind('p-4 pr-2')}
          testID='slippage_select'
        >
          <SlippageToleranceRow slippage={slippage} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

function SlippageToleranceRow ({ slippage }: { slippage: BigNumber}): JSX.Element {
  return (
    <View
      style={tailwind('flex-row')}
    >
      <View style={tailwind('w-6/12 flex-grow')}>
        <ThemedText
          dark={tailwind('text-gray-200')}
          light={tailwind('text-black')}
          style={tailwind('text-sm mr-1')}
          testID='slippage_title'
        >
          {translate('screens/SlippageTolerance', 'Slippage tolerance')}
        </ThemedText>
      </View>
      <View
        style={tailwind('flex w-6/12 flex-row justify-end flex-wrap items-center')}
      >
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(val: string) => (
            <>
              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                style={tailwind('text-sm text-right')}
                testID='slippage_value'
              >
                {val}%
              </ThemedText>
              <ThemedIcon
                light={tailwind('text-primary-500')}
                dark={tailwind('text-darkprimary-500')}
                iconType='MaterialIcons'
                name='unfold-more'
                size={24}
              />
            </>
        )}
          thousandSeparator
          value={new BigNumber(slippage).toNumber()}
        />
      </View>
    </View>
  )
}
