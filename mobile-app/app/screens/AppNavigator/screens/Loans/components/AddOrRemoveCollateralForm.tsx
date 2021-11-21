import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { Button } from '@components/Button'
import { InputHelperText } from '@components/InputHelperText'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { useBottomSheetInternal } from '@gorhom/bottom-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { DFITokenSelector } from '@store/wallet'

export interface AddOrRemoveCollateralFormProps {
  token: TokenData
  collateralFactor: BigNumber
  available: string
  current?: BigNumber
  onButtonPress: (item: AddOrRemoveCollateralResponse) => void
  onCloseButtonPress: () => void
  isAdd: boolean
}

type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'AddOrRemoveCollateralFormProps'>

export interface AddOrRemoveCollateralResponse {
  token: TokenData
  amount: BigNumber
}

export const AddOrRemoveCollateralForm = React.memo(({ route }: Props): JSX.Element => {
  const {
    token,
    available,
    onButtonPress,
    onCloseButtonPress,
    collateralFactor,
    isAdd
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))

  const [collateralValue, setCollateralValue] = useState<string>('')
  const isConversionRequired = isAdd && token.id === '0' ? new BigNumber(collateralValue).gt(DFIToken.amount) : false
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
          {translate('components/AddOrRemoveCollateralForm', `How much {{symbol}} to ${isAdd ? 'add' : 'remove'}?`, {
            symbol: token.displaySymbol
          })}
        </ThemedText>
        {onCloseButtonPress !== undefined && (
          <TouchableOpacity onPress={onCloseButtonPress}>
            <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
          </TouchableOpacity>
        )}
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
            suffix={`% ${translate('components/AddOrRemoveCollateralForm', 'collateral factor')}`}
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
        onChangeText={(text) => setCollateralValue(text)}
        onClearButtonPress={() => setCollateralValue('')}
        placeholder={translate('components/AddOrRemoveCollateralForm', 'Enter an amount')}
        style={tailwind('h-9 w-10/12 flex-grow')}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
      />
      <InputHelperText
        label={`${translate('components/AddOrRemoveCollateralForm', isAdd ? 'Available' : 'Current')}: `}
        content={available}
        suffix={` ${token.displaySymbol}`}
        styleProps={tailwind('font-medium')}
      />
      {isConversionRequired &&
        <View style={tailwind('mt-4 mb-6')}>
          <ConversionInfoText />
        </View>}
      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('components/AddOrRemoveCollateralForm', isAdd ? 'ADD TOKEN AS COLLATERAL' : 'REMOVE COLLATERAL AMOUNT')}
        onPress={() => onButtonPress({
          token,
          amount: new BigNumber(collateralValue)
        })}
        margin='mt-8 mb-10'
      />
    </ThemedScrollView>
  )
})
