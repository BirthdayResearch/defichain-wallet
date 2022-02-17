import { ReactElement, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { View } from '@components'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { WalletTextInput } from '@components/WalletTextInput'
import { debounce } from 'lodash'

const percentageList = ['0.5', '1', '3', '5', '10']

interface SlippageToleranceProps {
  slippage: BigNumber
  slippageError?: SlippageError
  setSlippageError: (error?: SlippageError) => void
  setSlippage: (slippage: BigNumber) => void
}

export function SlippageTolerance ({ slippage, setSlippage, slippageError, setSlippageError }: SlippageToleranceProps): JSX.Element {
  const [isCustomSlippage, setIsCustomSlippage] = useState(false)
  const slippageTolerance = {
    title: 'Slippage tolerance',
    message: 'Slippages are rate changes that occur within an order transaction. Choose how much of this slippage are you willing to accept.'
  }

  useEffect(() => {
    setIsCustomSlippage(!percentageList.includes(new BigNumber(slippage).toString()))
  }, [])

  return (
    <ThemedView
      style={tailwind('flex-row items-center w-full')}
    >
      <View style={tailwind('px-4 mt-5 w-full')}>
        <View
          testID='slippage_tolerance_heading'
          style={tailwind(['flex-row items-center justify-between'])}
        >
          <View style={tailwind('flex-row items-center')}>
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('mr-1')}
            >
              {translate('screens/SlippageTolerance', 'Slippage tolerance')}
            </ThemedText>
            <BottomSheetInfo alertInfo={slippageTolerance} name={slippageTolerance.title} />
          </View>
        </View>
        <SlippageSelector
          slippage={slippage}
          slippageError={slippageError}
          setSlippageError={setSlippageError}
          isCustomSlippage={isCustomSlippage}
          setIsCustomSlippage={setIsCustomSlippage}
          onSubmitSlippage={setSlippage}
        />
      </View>
    </ThemedView>
  )
}

interface SlippageSelectorProps {
  isCustomSlippage: boolean
  onSubmitSlippage: (val: BigNumber, isCustomSlippage: boolean) => void
  setIsCustomSlippage: (val: boolean) => void
  slippage: BigNumber
  slippageError?: SlippageError
  setSlippageError: (error?: SlippageError) => void
}

export interface SlippageError {
  type: 'error' | 'helper'
  text?: string
}

function SlippageSelector ({ isCustomSlippage, onSubmitSlippage, slippage, setIsCustomSlippage, slippageError, setSlippageError }: SlippageSelectorProps): JSX.Element {
  const [selectedSlippage, setSelectedSlippage] = useState(slippage.toString())
  const [isRiskWarningDisplayed, setIsRiskWarningDisplayed] = useState(false)
  const submitSlippage = debounce(onSubmitSlippage, 500)

  const onSlippageChange = (value: string): void => {
    setSelectedSlippage(value)
    submitSlippage(new BigNumber(value), isCustomSlippage)
  }

  const isSlippageValid = (): boolean => {
    return slippageError === undefined || slippageError?.type === 'helper'
  }

  const validateSlippage = (value: string): void => {
    if (value === undefined || value === '') {
      setSlippageError({
        type: 'error',
        text: translate('screens/SlippageTolerance', 'Required field is missing')
      })
      return
    } else if (!(new BigNumber(value).gte(0) && new BigNumber(value).lte(100))) {
      setSlippageError({
        type: 'error',
        text: translate('screens/SlippageTolerance', 'Slippage rate must range from 0-100%')
      })
      return
    }

    setSlippageError(undefined)
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
              setIsCustomSlippage(false)
              onSlippageChange(value)
            }}
            isActive={!isCustomSlippage && selectedSlippage === value}
            label={`${value}%`}
          />
        ))}
        <SlippageButton
          onPress={() => {
            setIsCustomSlippage(true)
          }}
          icon={
            <ThemedIcon
              size={14}
              name='edit'
              iconType='MaterialIcons'
              style={tailwind('mr-1')}
              dark={tailwind(`${isCustomSlippage ? 'text-darkprimary-500' : 'text-gray-50'}`)}
              light={tailwind(`${isCustomSlippage ? 'text-primary-500' : 'text-gray-900'}`)}
            />
          }
          isActive={isCustomSlippage}
          label={translate('screens/SlippageTolerance', 'Custom')}
        />
      </View>

      {isCustomSlippage && (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row w-full')}
        >
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
            onClearButtonPress={() => onSlippageChange('')}
            inputType='numeric'
            valid={isSlippageValid()}
            inlineText={slippageError}
          />
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
    </>
  )
}

function SlippageButton ({ onPress, isActive, label, icon }: { onPress: () => void, isActive: boolean, label: string, icon?: ReactElement }): JSX.Element {
  const buttonStyles = 'flex flex-row px-2 py-1.5 border rounded items-center'
  const activeStyle = 'bg-primary-50 border-primary-100 text-primary-500'
  return (
    <View style={tailwind('mr-1.5 mt-2')}>
      <ThemedTouchableOpacity
        key={label}
        onPress={onPress}
        light={tailwind('border-gray-300')}
        dark={tailwind('border-gray-600')}
        style={tailwind(`${buttonStyles} ${isActive ? activeStyle : ''} `)}
        testID={`slippage_${label}`}
      >
        {icon}
        <ThemedText
          dark={tailwind(`${isActive ? 'text-darkprimary-500 font-semibold' : 'text-gray-50'}`)}
          light={tailwind(`${isActive ? 'text-primary-500 font-semibold' : 'text-gray-900'}`)}
          style={tailwind('text-sm')}
        >
          {label}
        </ThemedText>
      </ThemedTouchableOpacity>
    </View>
  )
}
