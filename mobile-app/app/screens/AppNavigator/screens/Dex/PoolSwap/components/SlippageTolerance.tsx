import React, { useCallback, useEffect, useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useBottomSheetInternal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { Button } from '@components/Button'
import { View } from '@components'
import { BottomSheetModal } from '@components/BottomSheetModal'

const SLIPPAGE_WARNING = 'Slippage rate changes occur within a transaction. Select preferred slippage rate.'
const SLIPPAGE_MODAL_NAME = 'SlippageTolerance'

interface SlippageToleranceProps {
  slippage: number
  setSlippage: (slippage: number) => void
}

export function SlippageTolerance ({ slippage, setSlippage }: SlippageToleranceProps): JSX.Element {
  const { dismiss } = useBottomSheetModal()
  const [isCustomSlippage, setIsCustomSlippage] = useState(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  const onSubmitSlippage = (val: number, isCustom: boolean): void => {
    setIsCustomSlippage(isCustom)
    setSlippage(val)
    setIsSelectorOpen(false)
    dismiss(SLIPPAGE_MODAL_NAME)
  }

  return (
    <>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex-row items-center flex-grow py-4 px-4 pl-0 ')}
      >
        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            testID='slippage_title'
          >
            {translate('screens/SlippageTolerance', 'Slippage Tolerance')}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>
          {Platform.OS === 'web'
          ? (
            <TouchableOpacity
              onPress={() => {
                setIsSelectorOpen(true)
              }}
              style={tailwind('flex-row')}
              testID='slippage_select'
            >
              <SelectedValue slippage={slippage} />
            </TouchableOpacity>
          )
          : (
            <BottomSheetModal
              name={SLIPPAGE_MODAL_NAME}
              snapPoints={['55%']}
              containerStyle='flex-row justify-between items-center'
              triggerComponent={<SelectedValue slippage={slippage} />}
            >
              <ThemedView
                dark={tailwind('bg-gray-800 border-b border-gray-700')}
                light={tailwind('bg-white border-b border-gray-200')}
                style={tailwind('p-4')}
              >
                <SlippageHeader />
                <SlippageSelector
                  slippage={slippage}
                  isCustomSlippage={isCustomSlippage}
                  onSubmitSlippage={onSubmitSlippage}
                />
              </ThemedView>
            </BottomSheetModal>
          )}
        </View>
      </ThemedView>

      {(Platform.OS === 'web' && isSelectorOpen) && (
        <ThemedView
          dark={tailwind('bg-gray-800 border-b border-gray-700')}
          light={tailwind('bg-white border-b border-gray-200')}
          style={tailwind('p-4')}
        >
          <SlippageHeader />
          <SlippageSelector
            slippage={slippage}
            isCustomSlippage={isCustomSlippage}
            onSubmitSlippage={onSubmitSlippage}
          />
        </ThemedView>
      )}
    </>
  )
}

function SlippageButton ({ onPress, isActive, label }: { onPress: () => void, isActive: boolean, label: string }): JSX.Element {
  const buttonStyles = 'flex px-2 py-1.5 border border-gray-300 rounded mr-2'
  const activeStyle = 'bg-primary-500 border-primary-500'
  return (
    <TouchableOpacity
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
    </TouchableOpacity>
  )
}

function SelectedValue ({ slippage }: { slippage: number }): JSX.Element {
  return (
    <NumberFormat
      decimalScale={8}
      displayType='text'
      renderText={(val: string) => (
        <>
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('text-base text-right')}
            testID='slippage_value'
          >
            {val}%
          </ThemedText>
          <ThemedIcon
            dark={tailwind('text-gray-200')}
            iconType='MaterialIcons'
            light={tailwind('text-black')}
            name='chevron-right'
            size={24}
          />
        </>
      )}
      thousandSeparator
      value={slippage}
    />
  )
}

function SlippageHeader (): JSX.Element {
  return (
    <>
      <View
        testID='slippage_tolerance_heading'
        style={tailwind('flex-row mb-3 items-center ')}
      >
        <ThemedIcon
          size={20}
          name='info-outline'
          iconType='MaterialIcons'
          dark={tailwind('text-gray-200')}
          light={tailwind('text-gray-700')}
          style={tailwind('mr-2 mt-0.5')}
        />
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind(`${Platform.OS === 'web' ? 'text-base' : 'text-2xl'} font-semibold`)}
        >
          {translate('screens/SlippageTolerance', 'Slippage Tolerance')}
        </ThemedText>
      </View>
      <View testID='slippage_tolerance_description' style={tailwind('flex-row mb-6 items-center')}>
        <ThemedText
          style={tailwind('text-base')}
          dark={tailwind('text-gray-200')}
          light={tailwind('text-gray-700')}
        >
          {translate('screens/SlippageTolerance', SLIPPAGE_WARNING)}
        </ThemedText>
      </View>
    </>
  )
}

interface SlippageSelectorProps {
  isCustomSlippage: boolean
  slippage: number
  onSubmitSlippage: (val: number, isCustomSlippage: boolean) => void
}

function SlippageSelector ({ slippage, onSubmitSlippage, isCustomSlippage }: SlippageSelectorProps): JSX.Element {
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
        text: translate('screens/SlippageTolerance', 'This field must be from 0-100%')
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
      <View style={tailwind('flex-row mb-3')}>
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
          onPress={() => setIsCustom(true)}
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
          style={tailwind('text-sm mt-1')}
          testID='slippage_warning'
        >
          {translate('screens/SlippageTolerance', 'Proceed at your own risk')}
        </ThemedText>
      )}
      <Button
        disabled={!isSlippageValid()}
        label={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
        onPress={() => {
          onSubmitSlippage(parseInt(selectedSlippage), isCustomSlippage)
        }}
        testID='button_tolerance_submit'
        title={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
      />
    </>
  )
}

interface BottomSheetInputProps {
  onSlippageChange: (value: string) => void
  setSelectedSlippage: (value: string) => void
  isSlippageValid: () => boolean
  selectedSlippage: string
  error: {
    type: 'error' | 'helper'
    text?: string
  } | undefined
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
      shouldHandleKeyboardEvents.value = true
    },
    [shouldHandleKeyboardEvents]
  )
  const handleOnBlur = useCallback(
    () => {
      shouldHandleKeyboardEvents.value = false
    },
    [shouldHandleKeyboardEvents]
  )

  return (
    <WalletTextInput
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
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    />
)
}
