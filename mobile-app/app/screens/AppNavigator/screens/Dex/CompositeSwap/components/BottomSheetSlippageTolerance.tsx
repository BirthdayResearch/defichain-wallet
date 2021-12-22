import { View } from '@components'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React, { memo, useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import BigNumber from 'bignumber.js'
import { TouchableOpacity as BottomSheetTouchableOpacity, useBottomSheetInternal } from '@gorhom/bottom-sheet'
import { WalletTextInput } from '@components/WalletTextInput'
import { Button } from '@components/Button'
import { ScrollView } from 'react-native-gesture-handler'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

interface BottomSheetSlippageToleranceProps {
  isCustomSlippage: boolean
  onSubmitSlippage: (val: BigNumber, isCustomSlippage: boolean) => void
  slippage: BigNumber
  onCloseButtonPress: () => void
}

export const BottomSheetSlippageTolerance = ({
  isCustomSlippage,
  onSubmitSlippage,
  slippage,
  onCloseButtonPress
}: BottomSheetSlippageToleranceProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  return (
    <ScrollView
      contentContainerStyle={tailwind('py-6 px-4')}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    >
      <SlippageHeader onCloseButtonPress={onCloseButtonPress} />
      <SlippageSelector
        slippage={slippage}
        isCustomSlippage={isCustomSlippage}
        onSubmitSlippage={onSubmitSlippage}
        onCloseButtonPress={onCloseButtonPress}
      />
    </ScrollView>
  )
})

export function SlippageHeader (props: { onCloseButtonPress: () => void }): JSX.Element {
  return (
    <>
      <View
        testID='slippage_tolerance_heading'
        style={tailwind(['flex-row mb-3 items-center justify-between', { '-mt-5': Platform.OS !== 'web' }])}
      >
        <View style={tailwind('flex-row items-center')}>
          <ThemedIcon
            size={17}
            name='info-outline'
            iconType='MaterialIcons'
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
            style={tailwind('mr-2')}
          />
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('text-xl font-semibold')}
          >
            {translate('screens/SlippageTolerance', 'Slippage Tolerance')}
          </ThemedText>
        </View>
        <BottomSheetTouchableOpacity onPress={props.onCloseButtonPress}>
          <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
        </BottomSheetTouchableOpacity>
      </View>
      <View testID='slippage_tolerance_description' style={tailwind('flex-row mb-3 items-center')}>
        <ThemedText
          style={tailwind('text-base')}
          dark={tailwind('text-gray-200')}
          light={tailwind('text-gray-700')}
        >
          {translate('screens/SlippageTolerance', 'Slippage rate changes occur within a transaction. Select preferred slippage rate.')}
        </ThemedText>
      </View>
    </>
  )
}

interface SlippageSelectorProps {
  isCustomSlippage: boolean
  onSubmitSlippage: (val: BigNumber, isCustomSlippage: boolean) => void
  slippage: BigNumber
  onCloseButtonPress: () => void
}

export function SlippageSelector ({ isCustomSlippage, onSubmitSlippage, slippage, onCloseButtonPress }: SlippageSelectorProps): JSX.Element {
  const percentageList = ['1', '3', '5', '10', '20']
  const [selectedSlippage, setSelectedSlippage] = useState(slippage.toString())
  const [isCustom, setIsCustom] = useState(isCustomSlippage)
  const [isRiskWarningDisplayed, setIsRiskWarningDisplayed] = useState(false)
  const [error, setError] = useState<{
    type: 'error' | 'helper'
    text?: string
  } | undefined>()

  const onSlippageChange = (value: string): void => {
    setSelectedSlippage(value.toString())
  }

  const isSlippageValid = (): boolean => {
    return error === undefined || error?.type === 'helper'
  }

  const validateSlippage = (value: string): void => {
    if (value === undefined || value === '') {
      setError({
        type: 'error',
        text: translate('screens/SlippageTolerance', 'Required field is missing')
      })
      return
    } else if (!(new BigNumber(value).gte(0) && new BigNumber(value).lte(100))) {
      setError({
        type: 'error',
        text: translate('screens/SlippageTolerance', 'Slippage rate must range from 0-100%')
      })
      return
    }

    setError(undefined)
  }

  useEffect(() => {
    validateSlippage(selectedSlippage)
    setIsRiskWarningDisplayed((new BigNumber(selectedSlippage).gte(20) && new BigNumber(selectedSlippage).lte(100)))
  }, [selectedSlippage])

  return (
    <>
      <View style={tailwind('flex-row mb-3 flex-wrap')}>
        {percentageList.map((value) => (
          <SlippageButton
            key={value}
            onPress={() => {
              setIsCustom(false)
              setSelectedSlippage(value)
            }}
            isActive={!isCustom && selectedSlippage === value}
            label={`${value}%`}
          />
              ))}
        <SlippageButton
          onPress={() => {
            setIsCustom(true)
          }}
          isActive={isCustom}
          label={translate('screens/SlippageTolerance', 'Custom')}
        />
      </View>

      {isCustom && (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row w-full')}
        >
          {Platform.OS === 'web'
          ? <WalletTextInput
              onChangeText={onSlippageChange}
              keyboardType='numeric'
              autoCapitalize='none'
              placeholder='0.00%'
              style={tailwind('flex-grow h-8')}
              testID='slippage_input'
              value={selectedSlippage !== undefined ? selectedSlippage.toString() : ''}
              displayClearButton={selectedSlippage !== undefined}
              onClearButtonPress={() => setSelectedSlippage('')}
              inputType='numeric'
              valid={isSlippageValid()}
              inlineText={error}
            />
          : (<BottomSheetInput
              onSlippageChange={onSlippageChange}
              selectedSlippage={selectedSlippage}
              setSelectedSlippage={setSelectedSlippage}
              isSlippageValid={isSlippageValid}
              error={error}
             />)}
        </ThemedView>
      )}

      {isRiskWarningDisplayed && (
        <ThemedText
          light={tailwind('text-error-500')}
          dark={tailwind('text-darkerror-500')}
          style={tailwind('text-sm mb-3')}
          testID='slippage_warning'
        >
          {translate('screens/SlippageTolerance', 'Proceed at your own risk')}
        </ThemedText>
      )}
      <Button
        disabled={!isSlippageValid()}
        label={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
        onPress={() => {
          onSubmitSlippage(new BigNumber(selectedSlippage), isCustomSlippage)
          onCloseButtonPress()
        }}
        testID='button_tolerance_submit'
        title={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
        style={tailwind('w-full')}
        margin='mt-3'
      />
    </>
  )
}

function SlippageButton ({ onPress, isActive, label }: { onPress: () => void, isActive: boolean, label: string }): JSX.Element {
  const buttonStyles = 'flex px-2 py-1.5 border border-gray-300 rounded mr-2 mt-2'
  const activeStyle = 'bg-primary-500 border-primary-500'
  return (
    <BottomSheetTouchableOpacity
      key={label}
      onPress={onPress}
      style={tailwind(`${buttonStyles} ${isActive ? activeStyle : ''}`)}
      testID={`slippage_${label}`}
    >
      <ThemedText
        dark={tailwind(`${isActive ? 'text-gray-200' : ''}`)}
        light={tailwind(`${isActive ? 'text-white' : ''}`)}
        style={tailwind('text-primary-500 text-sm')}
      >
        {label}
      </ThemedText>
    </BottomSheetTouchableOpacity>
  )
}

interface BottomSheetInputProps {
  error: {
    type: 'error' | 'helper'
    text?: string
  } | undefined
  isSlippageValid: () => boolean
  onSlippageChange: (val: string) => void
  setSelectedSlippage: (val: string) => void
  selectedSlippage: string
}

/**
 * This automatically adjust the snap points when opening the native keyboard in mobile inside the Bottom Sheet Modal
 * @reference: https://gorhom.github.io/react-native-bottom-sheet/keyboard-handling/
*/
const BottomSheetInput = (props: BottomSheetInputProps): JSX.Element => {
  const { onSlippageChange, selectedSlippage, setSelectedSlippage, isSlippageValid, error } = props
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal()

  const handleOnFocus = useCallback(
    () => {
      if (Platform.OS === 'android') {
        // skipping android because it already offset keyboard height
        return
      }
      shouldHandleKeyboardEvents.value = true
    },
    [shouldHandleKeyboardEvents]
  )
  const handleOnBlur = useCallback(
    () => {
      if (Platform.OS === 'android') {
        // skipping android because it already offset keyboard height
        return
      }
      shouldHandleKeyboardEvents.value = false
    },
    [shouldHandleKeyboardEvents]
  )

  return (
    <WalletTextInput
      autoFocus
      onChangeText={onSlippageChange}
      keyboardType='numeric'
      autoCapitalize='none'
      placeholder='0.00%'
      style={tailwind('flex-grow w-2/5 h-8')}
      containerStyle='mb-1 w-full flex-col'
      testID='slippage_input'
      value={selectedSlippage !== undefined ? selectedSlippage.toString() : ''}
      displayClearButton={selectedSlippage !== undefined}
      onClearButtonPress={() => setSelectedSlippage('')}
      inputType='numeric'
      valid={isSlippageValid()}
      inlineText={error}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    />
)
}
