import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { Button } from '@components/Button'
import { InputHelperText } from '@components/InputHelperText'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { useBottomSheetInternal } from '@gorhom/bottom-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'

export interface AddOrEditCollateralFormProps {
  token: TokenData
  collateralFactor: BigNumber
  available: string
  current?: BigNumber
  onButtonPress: (item: AddOrEditCollateralResponse) => void
  onCloseButtonPress: () => void
}

type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'AddOrEditCollateralForm'>

export interface AddOrEditCollateralResponse {
  token: TokenData
  amount: BigNumber
}

export const AddOrEditCollateralForm = React.memo(({ route }: Props): JSX.Element => {
  const {
    token,
    available,
    current,
    onButtonPress,
    onCloseButtonPress
  } = route.params
  const [collateralValue, setCollateralValue] = useState<string>(current?.toFixed(8) ?? '')
  const [isValid, setIsValid] = useState(false)
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal()
  const handleOnFocus = useCallback(
    () => {
      if (Platform.OS === 'ios') {
        shouldHandleKeyboardEvents.value = true
      }
    },
    [shouldHandleKeyboardEvents]
  )
  const handleOnBlur = useCallback(
    () => {
      if (Platform.OS === 'ios') {
        shouldHandleKeyboardEvents.value = true
      }
    },
    [shouldHandleKeyboardEvents]
  )
  const validateInput = (input: string): void => {
    const formattedInput = new BigNumber(input)
    if (formattedInput.isGreaterThan(available) || formattedInput.isLessThanOrEqualTo(0) || formattedInput.isNaN()) {
      setIsValid(false)
    } else {
      setIsValid(true)
    }
  }

  useEffect(() => {
    validateInput(collateralValue)
  }, [collateralValue])

  return (
    <ThemedScrollView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('p-4 flex-1')}
    >
      <View style={tailwind('flex flex-row items-center mb-2')}>
        <ThemedText style={tailwind('flex-1 mb-2 text-lg font-medium')}>
          {translate('components/AddOrEditCollateralForm', 'How much {{symbol}} to add?', { symbol: token.displaySymbol })}
        </ThemedText>
        <TouchableOpacity onPress={onCloseButtonPress}>
          <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
        </TouchableOpacity>
      </View>
      <View style={tailwind('flex flex-row items-center mb-2')}>
        <SymbolIcon
          symbol={token.displaySymbol} styleProps={{
          width: 24,
          height: 24
        }}
        />
        <ThemedText
          style={tailwind('mx-2')}
        >
          {token.displaySymbol}
        </ThemedText>{/*
        <ThemedView
          light={tailwind('text-gray-700 border-gray-700')}
          dark={tailwind('text-gray-300 border-gray-300')}
          style={tailwind('border rounded')}
        >
          <NumberFormat
            value={collateralFactor.toFixed(2)}
            decimalScale={2}
            displayType='text'
            suffix={`% ${translate('components/AddOrEditCollateralForm', 'collateral factor')}`}
            renderText={value =>
              <ThemedText
                light={tailwind('text-gray-700')}
                dark={tailwind('text-gray-300')}
                style={tailwind('text-xs font-medium px-1')}
              >
                {value}
              </ThemedText>}
          />
        </ThemedView> */}
      </View>
      <WalletTextInput
        value={collateralValue}
        inputType='numeric'
        displayClearButton={collateralValue !== ''}
        onChangeText={(text) => setCollateralValue(text)}
        onClearButtonPress={() => setCollateralValue('')}
        placeholder={translate('components/AddOrEditCollateralForm', 'Enter an amount')}
        style={tailwind('h-9 w-10/12 flex-grow')}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
      />
      <InputHelperText
        label={`${translate('components/AddOrEditCollateralForm', 'Available')}: `}
        content={available}
        suffix={` ${token.displaySymbol}`}
        styleProps={tailwind('font-medium')}
      />
      <Button
        disabled={!isValid}
        label={translate('components/AddOrEditCollateralForm', 'ADD TOKEN AS COLLATERAL')}
        onPress={() => onButtonPress({
          token,
          amount: new BigNumber(collateralValue)
        })}
        margin='mt-8 mb-10'
      />
    </ThemedScrollView>
  )
})
