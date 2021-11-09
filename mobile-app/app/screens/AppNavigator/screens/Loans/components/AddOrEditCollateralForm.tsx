import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { Button } from '@components/Button'
import { InputHelperText } from '@components/InputHelperText'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedText, ThemedView } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { useBottomSheetInternal } from '@gorhom/bottom-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'

export interface AddOrEditCollateralFormProps {
  token: string
  collateralFactor: BigNumber
  available: BigNumber
  onButtonPress: () => void
}

type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'AddOrEditCollateralForm'>

export const AddOrEditCollateralForm = React.memo(({ route }: Props): JSX.Element => {
  const {
    token,
    collateralFactor,
    available
  } = route.params
  const [collateralValue, setCollateralValue] = useState<string>('123')
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
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('p-4')}
    >
      <ThemedText style={tailwind('mb-2 text-lg font-medium')}>
        {translate('components/AddOrEditCollateralForm', 'How much {{token}} to add?', { token: token })}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center mb-2')}>
        <SymbolIcon symbol={token} styleProps={{ width: 24, height: 24 }} />
        <ThemedText
          style={tailwind('mx-2')}
        >
          {token}
        </ThemedText>
        <ThemedView
          light={tailwind('text-gray-700 border-gray-700')}
          dark={tailwind('text-gray-300 border-gray-300')}
          style={tailwind('border rounded')}
        >
          <NumberFormat
            value={collateralFactor.toFixed(2)}
            decimalScale={2}
            displayType='text'
            suffix='%'
            renderText={value =>
              <ThemedText
                light={tailwind('text-gray-700')}
                dark={tailwind('text-gray-300')}
                style={tailwind('text-xs font-medium px-1')}
              >
                {value}
              </ThemedText>}
          />
        </ThemedView>
      </View>
      <WalletTextInput
        value={collateralValue}
        inputType='numeric'
        displayClearButton={collateralValue !== ''}
        onChangeText={(text) => console.log('change', text)}
        onClearButtonPress={() => setCollateralValue('')}
        placeholder={translate('components/AddOrEditCollateralForm', 'Enter an amount')}
        style={tailwind('h-9')}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
      />
      <InputHelperText
        label={`${translate('screens/ConvertScreen', 'Available')}: `}
        content={available.toFixed(8)}
        suffix={` ${token}`}
      />
      <Button
        disabled
        label={translate('components/AddOrEditCollateralForm', 'ADD TOKEN AS COLLATERAL')}
        onPress={() => { /* TODO: handle button press */ }}
        margin='mt-8 mb-10'
      />
    </ThemedView>
  )
}, areEqual)

function areEqual (prev: Readonly<any>, next: Readonly<any>): boolean {
  console.log(prev, next)
  return true
}
