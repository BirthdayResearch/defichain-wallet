import React, { useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletTextInput } from '@components/WalletTextInput'
import { Button } from '@components/Button'
import { View } from '@components'
import { BottomSheetModal } from '@components/BottomSheetModal'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'

interface SlippageToleranceP {
  slippage: number
  setSlippage: (slippage: number) => void
}

export function SlippageTolerance (props: SlippageToleranceP): JSX.Element {
  const { slippage, setSlippage } = props
  const [isCustomSlippage, setIsCustomSlippage] = useState<boolean>(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false)
  const modalName = 'SlippageTolerance'
  const { dismiss } = useBottomSheetModal()

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
            testID='title_slippage'
          >
            {translate('screens/SlippageTolerance', 'Slippage Tolerance')}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>

          {Platform.OS === 'web'
          ? (
            <TouchableOpacity onPress={() => setIsSelectorOpen(true)} style={tailwind('flex-row')}>
              <SelectedValue slippage={slippage} />
            </TouchableOpacity>
          )
          : (
            <BottomSheetModal
              name={modalName}
              snapPoints={['60%']}
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
                  onSubmitSlippage={(val, isCustom) => {
                    setIsCustomSlippage(isCustom)
                    setSlippage(val)
                    dismiss(modalName)
                  }}
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
          <SlippageSelector
            slippage={slippage}
            isCustomSlippage={isCustomSlippage}
            onSubmitSlippage={(val, isCustom) => {
              setIsCustomSlippage(isCustom)
              setIsSelectorOpen(false)
              setSlippage(val)
            }}
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
        style={tailwind('font-medium text-primary-500')}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

const SelectedValue = ({ slippage }: { slippage: number }): JSX.Element => {
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
            {val}
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
        style={tailwind('flex-row mb-3 items-center')}
      >
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-2xl font-semibold')}
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
          {translate('screens/SlippageTolerance', 'Slippage are rate changes that occur within an order transaction. Choose how much of this slippage you are willing to accept.')}
        </ThemedText>
      </View>
    </>
  )
}

interface SlippageSelectorP {
  isCustomSlippage: boolean
  slippage: number
  onSubmitSlippage: (val: number, isCustomSlippage: boolean) => void
}

const SlippageSelector = ({ slippage, onSubmitSlippage, isCustomSlippage }: SlippageSelectorP): JSX.Element => {
  const [selectedSlippage, setSelectedSlippage] = useState<number>(slippage)
  const [isCustom, setIsCustom] = useState<boolean>(isCustomSlippage)
  const [customSlippage, setCustomSlippage] = useState<string>(isCustom ? new BigNumber(slippage).times(100).toString() : '')
  const percentageList = [
    { label: '1%', value: 0.01 },
    { label: '3%', value: 0.03 },
    { label: '5%', value: 0.05 },
    { label: '10%', value: 0.1 },
    { label: '20%', value: 0.2 }
  ]

  const onSetSlippage = (): void => {
    let value = selectedSlippage
    if (isCustom) {
      value = new BigNumber(customSlippage).div(100).toNumber()
    }
    return onSubmitSlippage(value, isCustom)
  }

  const isDisabled = (): boolean => {
    const value: number | string = isCustom ? customSlippage : selectedSlippage
    return !(new BigNumber(value).gte(0) && new BigNumber(value).lte(100))
  }

  return (
    <>
      <View style={tailwind('flex-row mb-3')}>
        {percentageList.map((p) => (
          <SlippageButton
            key={p.label}
            onPress={() => {
              setIsCustom(false)
              setSelectedSlippage(p.value)
            }}
            isActive={!isCustom && selectedSlippage === p.value}
            label={p.label}
          />
              ))}
        <SlippageButton
          onPress={() => setIsCustom(true)}
          isActive={isCustom}
          label={translate('screens/SlippageTolerance', 'Custom')}
        />
      </View>

      {isCustom && (
        <WalletTextInput
          onChangeText={(value) => {
            setCustomSlippage(value)
          }}
          keyboardType='numeric'
          autoCapitalize='none'
          placeholder='0.00%'
          style={tailwind('flex-grow h-8')}
          testID='slippage_input'
          value={customSlippage}
          displayClearButton={customSlippage !== ''}
          onClearButtonPress={() => setCustomSlippage('')}
          inputType='numeric'
        />
      )}

      <Button
        disabled={isDisabled()}
        label={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
        onPress={onSetSlippage}
        testID='button_tolerance_submit'
        title={translate('screens/SlippageTolerance', 'USE THIS SLIPPAGE TOLERANCE')}
      />
    </>
  )
}
