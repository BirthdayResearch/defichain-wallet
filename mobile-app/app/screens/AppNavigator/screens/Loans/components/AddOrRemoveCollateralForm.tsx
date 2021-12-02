import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { Button } from '@components/Button'
import { InputHelperText } from '@components/InputHelperText'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { DFITokenSelector } from '@store/wallet'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'

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
  const isConversionRequired = isAdd && token.id === '0'
? (
    new BigNumber(collateralValue).isGreaterThan(DFIToken.amount) &&
    new BigNumber(collateralValue).isLessThanOrEqualTo(available)
  )
: false
  const [isValid, setIsValid] = useState(false)

  const validateInput = (input: string): void => {
    const formattedInput = new BigNumber(input)
    if (formattedInput.isGreaterThan(available) || formattedInput.isLessThanOrEqualTo(0) || formattedInput.isNaN()) {
      setIsValid(false)
    } else {
      setIsValid(true)
    }
  }

  const onAmountChange = (amount: string): void => {
    setCollateralValue(amount)
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
        onChangeText={onAmountChange}
        onClearButtonPress={() => setCollateralValue('')}
        placeholder={translate('components/AddOrRemoveCollateralForm', 'Enter an amount')}
        style={tailwind('h-9 w-6/12 flex-grow')}
        hasBottomSheet
      >
        <ThemedView
          dark={tailwind('bg-gray-800')}
          light={tailwind('bg-white')}
          style={tailwind('flex-row items-center')}
        >
          <SetAmountButton
            amount={new BigNumber(available)}
            onPress={onAmountChange}
            type={AmountButtonTypes.half}
          />

          <SetAmountButton
            amount={new BigNumber(available)}
            onPress={onAmountChange}
            type={AmountButtonTypes.max}
          />
        </ThemedView>
      </WalletTextInput>
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
        margin='mt-8 mb-2'
      />
      <ThemedText style={tailwind('text-xs text-center p-2 px-6')} light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}>
        {translate('components/AddOrRemoveCollateralForm', 'The collateral factor determines the degree of contribution of each collateral token.')}
      </ThemedText>
    </ThemedScrollView>
  )
})
