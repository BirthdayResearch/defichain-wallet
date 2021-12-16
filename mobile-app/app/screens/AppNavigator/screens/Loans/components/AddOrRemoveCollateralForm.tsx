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
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useResultingCollateralizationRatioByCollateral } from '../hooks/CollateralizationRatio'
import { useTotalCollateralValue } from '../hooks/CollateralPrice'
import { CollateralItem } from '../screens/EditCollateralScreen'

export interface AddOrRemoveCollateralFormProps {
  collateralItem: CollateralItem
  collateralFactor: BigNumber
  available: string
  current?: BigNumber
  onButtonPress: (item: AddOrRemoveCollateralResponse) => void
  onCloseButtonPress: () => void
  isAdd: boolean
  vault: LoanVaultActive
}

const COLOR_BARS_COUNT = 6
type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'AddOrRemoveCollateralFormProps'>

export interface AddOrRemoveCollateralResponse {
  token: TokenData
  amount: BigNumber
}

export const AddOrRemoveCollateralForm = React.memo(({ route }: Props): JSX.Element => {
  const {
    collateralItem: { token, activePrice },
    available,
    onButtonPress,
    onCloseButtonPress,
    collateralFactor,
    isAdd,
    vault
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
  const collateralInputValue = new BigNumber(collateralValue).isNaN() ? 0 : collateralValue
  const { totalCollateralValueInUSD } = useTotalCollateralValue({
    vault,
    token,
    isAdd,
    collateralInputValue,
    activePriceAmount: activePrice?.active === undefined ? new BigNumber(0) : new BigNumber(activePrice?.active.amount)
  })
  const {
    displayedColorBars,
    resultingColRatio
  } = useResultingCollateralizationRatioByCollateral({
    collateralValue: collateralValue,
    collateralRatio: new BigNumber(vault.collateralRatio ?? NaN),
    minCollateralRatio: new BigNumber(vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(vault.loanValue),
    numOfColorBars: COLOR_BARS_COUNT,
    totalCollateralValueInUSD
  })

  console.log({
    totalCollateralValueInUSD: totalCollateralValueInUSD.toFixed(2),
    resultingColRatio: resultingColRatio.toFixed(2),
    activePrice,
    vault
  })

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
        <ThemedText testID='form_title' style={tailwind('flex-1 mb-2 text-lg font-medium')}>
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
          testID={`token_symbol_${token.displaySymbol}`}
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
        testID='form_input_text'
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
        testID='form_balance_text'
        suffix={` ${token.displaySymbol}`}
        styleProps={tailwind('font-medium')}
      />
      <View style={tailwind('flex flex-row justify-between')}>
        <ThemedText>Resulting Collaterization</ThemedText>
        <ThemedText>{resultingColRatio.isNegative() || resultingColRatio.isNaN() ? 'N/A' : `${resultingColRatio.toFixed(2)}%`}</ThemedText>
      </View>
      <ColorBar displayedBarsLen={displayedColorBars} colorBarsLen={COLOR_BARS_COUNT} />
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
        testID='add_collateral_button_submit'
      />
      <ThemedText style={tailwind('text-xs text-center p-2 px-6')} light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}>
        {translate('components/AddOrRemoveCollateralForm', 'The collateral factor determines the degree of contribution of each collateral token.')}
      </ThemedText>
    </ThemedScrollView>
  )
})

function ColorBar (props: { colorBarsLen: number, displayedBarsLen: number }): JSX.Element {
  const width = 100 / props.colorBarsLen
  return (
    <View style={tailwind('flex flex-row mt-1')}>
      {Array.from(Array(props.colorBarsLen), (_v, i) => i + 1).map(index => {
        const isLiquidated = index <= (props.colorBarsLen / 3)
        const isAtRisk = index <= (props.colorBarsLen / 3) * 2 && !isLiquidated
        const isHealthy = !isLiquidated && !isAtRisk
        const isWithinRange = !isNaN(props.displayedBarsLen) && props.displayedBarsLen >= index

        return (
          <ThemedView
            key={index}
            light={tailwind({
              'bg-error-200': isLiquidated && isWithinRange,
              'bg-warning-300': isAtRisk && isWithinRange,
              'bg-success-300': isHealthy && isWithinRange,
              'bg-gray-200': !isWithinRange
            })}
            dark={tailwind('bg-darkerror-200')}
            style={[tailwind('h-1 mr-0.5'), { width: `${width}%` }]}
          />
          )
      })}
    </View>
  )
}
