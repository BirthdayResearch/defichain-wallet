import React, { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native'
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

const percentageList = ['1', '3', '5', '10', '20']

interface SlippageToleranceProps {
  slippage: BigNumber
  setSlippage: (slippage: BigNumber) => void
}

export function SlippageTolerance ({ slippage, setSlippage }: SlippageToleranceProps): JSX.Element {
  const { dismiss } = useBottomSheetModal()
  const [isCustomSlippage, setIsCustomSlippage] = useState(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [snapIndex, setSnapIndex] = useState(0)

  const onSubmitSlippage = (val: BigNumber, isCustom: boolean): void => {
    setIsCustomSlippage(isCustom)
    setSlippage(val)
    setIsSelectorOpen(false)
    dismiss(SLIPPAGE_MODAL_NAME)
  }

  const onSnapToIndex = (val: number): void => {
    setSnapIndex(val)
  }

  const getSnapPoints = (): string[] => {
    if (Platform.OS === 'ios') {
      return ['40%', '45%'] // ios measures space without keyboard
    } else if (Platform.OS === 'android') {
      return ['45%', '58%'] // android measure space by including keyboard
    }
    return []
  }

  useEffect(() => {
    setIsCustomSlippage(!percentageList.includes(new BigNumber(slippage).toString()))
  }, [slippage])

  return (
    <>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex-row items-center flex-grow w-full p-4 pr-2')}
      >
        {Platform.OS === 'web'
          ? (
            <TouchableOpacity
              onPress={() => {
                setIsSelectorOpen(true)
              }}
              style={tailwind('w-full')}
              testID='slippage_select'
            >
              <SelectedValue slippage={slippage} />
            </TouchableOpacity>
          )
          : (
            <BottomSheetModal
              name={SLIPPAGE_MODAL_NAME}
              snapPoints={getSnapPoints()}
              index={snapIndex}
              containerStyle='pt-7'
              enablePanDownToClose={false}
              enableContentPanningGesture={false}
              triggerComponent={<SelectedValue slippage={slippage} />}
              handleComponent={null}
            >
              {/* This handles the full display of elements when keyboard is open */}
              <KeyboardAvoidingView
                behavior='height'
                style={tailwind('flex', { 'pb-10': Platform.OS === 'ios' })}
              >
                <ScrollView>
                  <ThemedView
                    dark={tailwind('bg-gray-800')}
                    light={tailwind('bg-white')}
                    style={tailwind('p-4')}
                  >
                    <SlippageHeader />
                    <SlippageSelector
                      slippage={slippage}
                      isCustomSlippage={isCustomSlippage}
                      onSubmitSlippage={onSubmitSlippage}
                      onSnapToIndex={onSnapToIndex}
                    />
                  </ThemedView>
                </ScrollView>
              </KeyboardAvoidingView>
            </BottomSheetModal>
          )}
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
            onSnapToIndex={onSnapToIndex}
          />
        </ThemedView>
      )}
    </>
  )
}

function SlippageButton ({ onPress, isActive, label }: { onPress: () => void, isActive: boolean, label: string }): JSX.Element {
  const buttonStyles = 'flex px-2 py-1.5 border border-gray-300 rounded mr-2 mt-2'
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

function SelectedValue ({ slippage }: { slippage: BigNumber}): JSX.Element {
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
                style={tailwind('text-base text-right')}
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

function SlippageHeader (): JSX.Element {
  return (
    <>
      <View
        testID='slippage_tolerance_heading'
        style={tailwind(['flex-row mb-3 items-center', { '-mt-5': Platform.OS !== 'web' }])}
      >
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
      <View testID='slippage_tolerance_description' style={tailwind('flex-row mb-3 items-center')}>
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
  onSnapToIndex: (val: number) => void
  onSubmitSlippage: (val: BigNumber, isCustomSlippage: boolean) => void
  slippage: BigNumber
}

function SlippageSelector ({ isCustomSlippage, onSnapToIndex, onSubmitSlippage, slippage }: SlippageSelectorProps): JSX.Element {
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
              onSnapToIndex(0)
              setSelectedSlippage(value)
            }}
            isActive={!isCustom && selectedSlippage === value}
            label={`${value}%`}
          />
              ))}
        <SlippageButton
          onPress={() => {
            onSnapToIndex(1)
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
        }}
        testID='button_tolerance_submit'
        title={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
        style={tailwind('w-full')}
        margin='mt-3'
      />
    </>
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
