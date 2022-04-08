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
import { memo, useEffect, useState } from 'react'
import { Platform, TouchableOpacity, View, Text } from 'react-native'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { DFITokenSelector } from '@store/wallet'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import {
  useCollateralizationRatioColor,
  useResultingCollateralizationRatioByCollateral
} from '../hooks/CollateralizationRatio'
import { getCollateralPrice, useTotalCollateralValue, useValidCollateralRatio } from '../hooks/CollateralPrice'
import { CollateralItem } from '../screens/EditCollateralScreen'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { TokenIconGroup } from '@components/TokenIconGroup'

export interface AddOrRemoveCollateralFormProps {
  collateralItem: CollateralItem
  token: TokenData
  activePrice: BigNumber
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

export const AddOrRemoveCollateralForm = memo(({ route }: Props): JSX.Element => {
  const { isLight } = useThemeContext()
  const {
    token,
    activePrice,
    available,
    onButtonPress,
    onCloseButtonPress,
    collateralFactor,
    isAdd,
    vault,
    collateralItem
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const { isFeatureAvailable } = useFeatureFlagContext()

  const [collateralValue, setCollateralValue] = useState<string>('')
  const [vaultValue, setVaultValue] = useState<string>('')
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
    activePriceAmount: activePrice.isNaN() ? new BigNumber(0) : new BigNumber(activePrice)
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
  const colors = useCollateralizationRatioColor({
    colRatio: resultingColRatio,
    minColRatio: new BigNumber(vault.loanScheme.minColRatio ?? NaN),
    totalLoanAmount: new BigNumber(vault.loanValue ?? NaN),
    totalCollateralValue: totalCollateralValueInUSD
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

  const currentBalance = vault?.collateralAmounts?.find((c) => c.id === token.id)?.amount ?? '0'
  const totalCollateralVaultValue = new BigNumber(vault?.collateralValue) ?? new BigNumber(0)
  const inputValue = new BigNumber(collateralValue).isNaN() ? '0' : collateralValue
  const totalAmount = isAdd ? new BigNumber(currentBalance)?.plus(inputValue) : BigNumber.max(0, new BigNumber(currentBalance)?.minus(inputValue))
  const initialPrices = getCollateralPrice(new BigNumber(inputValue), collateralItem, new BigNumber(vault.collateralValue))
  const totalCalculatedCollateralValue = isAdd ? new BigNumber(totalCollateralVaultValue).plus(initialPrices?.collateralPrice) : new BigNumber(totalCollateralVaultValue).minus(initialPrices.collateralPrice)
  const prices = getCollateralPrice(totalAmount, collateralItem, totalCalculatedCollateralValue)
  const { requiredVaultShareTokens, requiredTokensShare, minRequiredTokensShare, hasLoan } = useValidCollateralRatio(
    vault?.collateralAmounts ?? [],
    totalCalculatedCollateralValue,
    new BigNumber(vault.loanValue),
    token.id,
    totalAmount
  )
  const isValidCollateralRatio = requiredTokensShare?.gte(minRequiredTokensShare)
  const removeMaxCollateralAmount = !isAdd && new BigNumber(collateralValue).isEqualTo(new BigNumber(available)) && prices.vaultShare.isNaN() && collateralItem !== undefined
  const displayNA = new BigNumber(collateralValue).isZero() || collateralValue === '' || removeMaxCollateralAmount

  useEffect(() => {
    setVaultValue(prices.vaultShare.toFixed(2))
  }, [prices.vaultShare])

  useEffect(() => {
    validateInput(collateralValue)
  }, [collateralValue])

  const bottomSheetComponents = {
    mobile: BottomSheetScrollView,
    web: ThemedScrollView
  }
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile
  const hasInvalidColRatio = resultingColRatio.isLessThanOrEqualTo(0) || resultingColRatio.isNaN() || !resultingColRatio.isFinite()

  return (
    <ScrollView
      style={tailwind(['p-4 flex-1', {
        'bg-white': isLight,
        'bg-gray-800': !isLight
      }])}
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
          symbol={token.displaySymbol} styleProps={tailwind('w-6 h-6')}
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
        onClearButtonPress={() => {
          setCollateralValue('')
          setVaultValue('')
        }}
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
        suffixType='component'
        styleProps={tailwind('font-medium')}
      >
        <ThemedText
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
          style={tailwind('text-sm font-medium')}
        >
          <Text>{' '}</Text>
          {token.displaySymbol}
          {
            !new BigNumber(activePrice).isZero() && (
              <NumberFormat
                value={getUSDPrecisedPrice(activePrice.multipliedBy(available))}
                thousandSeparator
                decimalScale={2}
                displayType='text'
                prefix='$'
                renderText={(val: string) => (
                  <ThemedText
                    dark={tailwind('text-gray-400')}
                    light={tailwind('text-gray-500')}
                    style={tailwind('text-xs leading-5')}
                  >
                    {` /${val}`}
                  </ThemedText>
                )}
              />
            )
          }
        </ThemedText>
      </InputHelperText>
      {isFeatureAvailable('dusd_vault_share')
        ? (
          <View
            style={tailwind('flex justify-between items-center flex-row w-full')}
          >
            <ThemedText style={tailwind('mr-2 w-6/12')}>{translate('components/AddOrRemoveCollateralForm', 'Vault requirement')}</ThemedText>

            <ThemedView
              style={tailwind('flex flex-row items-center mb-0 py-1 px-1.5 rounded-2xl')}
            >
              <TokenIconGroup
                testID='required_collateral_token_group'
                symbols={requiredVaultShareTokens}
                maxIconToDisplay={2}
              />
              <NumberFormat
                value={requiredTokensShare.toFixed(2)}
                thousandSeparator
                decimalScale={2}
                displayType='text'
                suffix='%'
                renderText={(val: string) => (
                  <ThemedView
                    style={tailwind('flex flex-row px-1 rounded')}
                  >
                    <ThemedText
                      light={tailwind(['text-gray-900', { 'text-error-500': !isValidCollateralRatio }])}
                      dark={tailwind(['text-gray-50', { 'text-error-500': !isValidCollateralRatio }])}
                      style={tailwind('text-sm font-medium')}
                      testID='bottom-sheet-vault-requirement-text'
                    >
                      {val}
                    </ThemedText>
                    <Text>{' '}</Text>
                    <ThemedText
                      dark={tailwind('text-gray-400')}
                      light={tailwind('text-gray-500')}
                      style={tailwind('text-sm font-medium')}
                    >
                      {`/${minRequiredTokensShare}%`}
                    </ThemedText>
                  </ThemedView>
                )}
              />
            </ThemedView>
          </View>
        )
        : (
          <ScrollView
            horizontal contentContainerStyle={tailwind(['flex justify-between items-center flex-row', {
            'flex-grow h-7': Platform.OS !== 'web',
            'w-full': Platform.OS === 'web'
          }])}
          >
            <ThemedText style={tailwind('mr-2')}>{translate('components/AddOrRemoveCollateralForm', 'Vault %')}</ThemedText>
            <ThemedView
              style={tailwind('flex flex-row items-center mb-0 py-1 px-1.5 rounded-2xl')}
            >
              <SymbolIcon
                symbol={token.displaySymbol}
              />
              {displayNA
              ? (
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  style={tailwind('px-1 text-sm font-medium')}
                  testID='bottom-sheet-vault-percentage-text'
                >{translate('components/AddOrRemoveCollateralForm', 'N/A')}
                </ThemedText>
              )
              : (
                <NumberFormat
                  value={vaultValue}
                  thousandSeparator
                  decimalScale={2}
                  displayType='text'
                  suffix='%'
                  renderText={(val: string) => (
                    <ThemedView
                      style={tailwind('px-1 rounded')}
                    >
                      <ThemedText
                        light={tailwind('text-gray-900')}
                        dark={tailwind('text-gray-50')}
                        style={tailwind('text-sm font-medium')}
                        testID='bottom-sheet-vault-percentage-text'
                      >
                        {val}
                      </ThemedText>
                    </ThemedView>
                  )}
                />)}
            </ThemedView>
          </ScrollView>
        )}
      <View style={tailwind('pt-2 flex justify-between flex-row')}>
        <ThemedText
          style={tailwind('mr-2')}
        >{translate('components/AddOrRemoveCollateralForm', 'Resulting collateralization')}
        </ThemedText>
        <ThemedText
          style={tailwind('font-semibold pr-2')}
          light={hasInvalidColRatio ? tailwind('text-gray-300') : colors.light}
          dark={hasInvalidColRatio ? tailwind('text-gray-300') : colors.dark}
          testID='resulting_collateralization'
        >{hasInvalidColRatio ? translate('components/AddOrRemoveCollateralForm', 'N/A') : `${resultingColRatio.toFixed(2)}%`}
        </ThemedText>
      </View>
      <ColorBar displayedBarsLen={displayedColorBars} colorBarsLen={COLOR_BARS_COUNT} />
      {isConversionRequired && (
        <View style={tailwind('mt-4 mb-6')}>
          <ConversionInfoText />
        </View>
      )}
      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob || (isFeatureAvailable('dusd_vault_share') && !isAdd && !isValidCollateralRatio && hasLoan)}
        label={translate('components/AddOrRemoveCollateralForm', isAdd ? 'ADD TOKEN AS COLLATERAL' : 'REMOVE COLLATERAL AMOUNT')}
        onPress={() => onButtonPress({
          token,
          amount: new BigNumber(collateralValue)
        })}
        margin='mt-6 mb-2'
        testID='add_collateral_button_submit'
      />
      {(isFeatureAvailable('dusd_vault_share') && !isAdd && !isValidCollateralRatio && requiredVaultShareTokens.includes(token.symbol)) && hasLoan && (
        <ThemedText
          dark={tailwind('text-error-500')}
          light={tailwind('text-error-500')}
          style={tailwind('text-sm text-center')}
          testID='vault_min_share_warning'
        >
          {translate('screens/BorrowLoanTokenScreen', 'Your vault needs at least 50% of DFI and/or DUSD as collateral')}
        </ThemedText>
      )}
      <ThemedText
        style={tailwind('text-xs text-center p-2 px-6 pb-12')}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
      >
        {translate('components/AddOrRemoveCollateralForm', 'The collateral factor determines the degree of contribution of each collateral token.')}
      </ThemedText>
    </ScrollView>
  )
})

function ColorBar (props: { colorBarsLen: number, displayedBarsLen: number }): JSX.Element {
  const width = 100 / props.colorBarsLen
  return (
    <View style={tailwind('flex flex-row mt-1 mr-3')}>
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
            dark={tailwind({
              'bg-darkerror-200': isLiquidated && isWithinRange,
              'bg-darkwarning-300': isAtRisk && isWithinRange,
              'bg-darksuccess-300': isHealthy && isWithinRange,
              'bg-gray-200': !isWithinRange
            })}
            style={[tailwind('h-1 mr-0.5'), { width: `${width}%` }]}
          />
        )
      })}
    </View>
  )
}
