import { View } from '@components'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useEffect, useState } from 'react'
import { LoanParamList } from '../LoansNavigator'
import { TransactionDetailsSection } from './BorrowLoanTokenScreen'
import BigNumber from 'bignumber.js'
import { WalletTextInput } from '@components/WalletTextInput'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { loanTokenByTokenId, vaultsSelector } from '@store/loans'
import { Button } from '@components/Button'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LoanToken, LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useLoanOperations } from '../hooks/LoanOperations'
import { useInterestPerBlock } from '../hooks/InterestPerBlock'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { useBlocksPerDay } from '../hooks/BlocksPerDay'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { useVaultStatus, VaultStatusTag } from '../components/VaultStatusTag'
import { useMaxLoanAmount } from '../hooks/MaxLoanAmount'
import { useCollateralizationRatioColor } from '../hooks/CollateralizationRatio'

type Props = StackScreenProps<LoanParamList, 'BorrowMoreScreen'>

export function BorrowMoreScreen ({ route, navigation }: Props): JSX.Element {
  const {
    vault: vaultFromRoute,
    loanTokenAmount
  } = route.params
  const client = useWhaleApiClient()
  const logger = useLogger()
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const loanToken = useSelector((state: RootState) => loanTokenByTokenId(state.loans, loanTokenAmount.id))
  const [vault, setVault] = useState<LoanVaultActive>(vaultFromRoute)
  const [amountToAdd, setAmountToAdd] = useState({
    amountInToken: new BigNumber(0),
    amountInUSD: new BigNumber(0),
    amountInput: ''
  })
  const [totalLoanWithInterest, setTotalLoanWithInterest] = useState(new BigNumber(NaN))
  const [totalAnnualInterest, setTotalAnnualInterest] = useState(new BigNumber(NaN))
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [valid, setValid] = useState(false)
  const interestPerBlock = useInterestPerBlock(new BigNumber(vault?.loanScheme.interestRate ?? NaN), new BigNumber(loanToken?.interest ?? NaN))
  const resultingColRatio = useResultingCollateralRatio(
    new BigNumber(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN),
    new BigNumber(amountToAdd.amountInToken),
    new BigNumber(getActivePrice(loanToken?.token.symbol ?? '', loanToken?.activePrice)),
    interestPerBlock
  )
  const blocksPerDay = useBlocksPerDay()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const canUseOperations = useLoanOperations(vault?.state)

  // Form update
  const [inputValidationMessage, setInputValidationMessage] = useState('')
  const isFormValid = (): boolean => {
    const amount = amountToAdd.amountInToken
    return !(amount.isNaN() ||
      amount.isLessThanOrEqualTo(0) ||
      vault === undefined ||
      resultingColRatio === undefined ||
      resultingColRatio.isLessThan(vault.loanScheme.minColRatio))
  }

  const updateInterestAmount = (): void => {
    const loanTokenPrice = getActivePrice(loanToken?.token.symbol ?? '', loanToken?.activePrice)
    if (vault === undefined || amountToAdd === undefined || loanTokenPrice === '0') {
      return
    }
    const annualInterest = interestPerBlock.multipliedBy(blocksPerDay * 365).multipliedBy(amountToAdd.amountInToken)
    setTotalAnnualInterest(annualInterest)
    setTotalLoanWithInterest(amountToAdd.amountInToken.plus(annualInterest))
  }

  const onSubmit = async (): Promise<void> => {
    if (!valid || vault === undefined || hasPendingJob || hasPendingBroadcastJob || loanToken === undefined) {
      return
    }

    navigation.navigate({
      name: 'ConfirmBorrowLoanTokenScreen',
      params: {
        loanToken,
        vault,
        amountToBorrow: amountToAdd.amountInToken.toFixed(8),
        totalInterestAmount: interestPerBlock,
        totalLoanWithInterest,
        fee,
        resultingColRatio
      }
    })
  }

  const validateInput = (): void => {
    const amount = new BigNumber(amountToAdd.amountInput)
    if (amount.isNaN() || amount.isZero() || vault === undefined) {
      setInputValidationMessage('')
      return
    }

    if (amount.isGreaterThan(0) && (vault.collateralValue === '0' || vault.collateralValue === undefined)) {
      setInputValidationMessage('Insufficient vault collateral to borrow this amount')
    } else if (resultingColRatio.isLessThan(vault.loanScheme.minColRatio)) {
      setInputValidationMessage('This amount may place the vault in liquidation')
    } else {
      setInputValidationMessage('')
    }
  }

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    const updatedVault = vaults.find(v => v.vaultId === vault?.vaultId) as LoanVaultActive
    setVault(updatedVault)
  }, [vaults])

  useEffect(() => {
    updateInterestAmount()
  }, [amountToAdd, vault])

  useEffect(() => {
    validateInput()
    setValid(isFormValid())
  }, [amountToAdd, vault, totalLoanWithInterest])

  useEffect(() => {
    if (loanToken === undefined) {
      return
    }

    setAmountToAdd({
      ...amountToAdd,
      amountInToken: new BigNumber(amountToAdd.amountInput),
      amountInUSD:
        amountToAdd.amountInput === '' || new BigNumber(amountToAdd.amountInput).isNaN()
          ? new BigNumber(0)
          : new BigNumber(amountToAdd.amountInput).times(getActivePrice(loanToken.token.symbol, loanToken.activePrice))
    })
  }, [amountToAdd.amountInput])

  if (vault === undefined || loanToken === undefined) {
    return (<></>)
  }

  return (
    <ThemedScrollView>
      <ThemedSectionTitle
        text={translate('screens/BorrowMoreScreen', 'YOU ARE BORROWING MORE FOR LOAN')}
      />
      <View style={tailwind('px-4')}>
        <LoanTokenInput
          loanTokenId={loanTokenAmount.id}
          displaySymbol={loanTokenAmount.displaySymbol}
          price={loanTokenAmount.activePrice}
          outstandingBalance={new BigNumber(loanTokenAmount.amount)}
        />
      </View>
      <ThemedSectionTitle
        text={translate('screens/BorrowMoreScreen', 'VAULT IN USE')}
      />
      <View style={tailwind('px-4')}>
        <VaultInput vault={vault} loanToken={loanToken} interestPerBlock={interestPerBlock} displayMaxLoanAmount />
      </View>
      <View style={tailwind('mt-2 mb-12 px-4')}>
        <WalletTextInput
          inputType='numeric'
          value={amountToAdd.amountInput}
          title={translate('screens/BorrowMoreScreen', 'How much do you want to add?')}
          placeholder={translate('screens/BorrowMoreScreen', 'Enter an amount')}
          onChangeText={(text: string) => setAmountToAdd({ ...amountToAdd, amountInput: text })}
          displayClearButton={amountToAdd.amountInput !== ''}
          onClearButtonPress={() => setAmountToAdd(({ ...amountToAdd, amountInput: '' }))}
          valid={inputValidationMessage === ''}
          inlineText={{
            type: 'error',
            text: translate('screens/BorrowMoreScreen', inputValidationMessage)
          }}
          style={tailwind('h-9 w-3/5 flex-grow')}
          testID='loan_add_input'
        />
        <WalletTextInput
          autoCapitalize='none'
          editable={false}
          placeholder='0.00'
          style={tailwind('flex-grow w-2/5')}
          testID='text_input_usd_value'
          value={getUSDPrecisedPrice(amountToAdd.amountInUSD)}
          displayClearButton={false}
          inputType='numeric'
        >
          <ThemedText>{translate('screens/BorrowMoreScreen', 'USD')}</ThemedText>
        </WalletTextInput>
      </View>
      <TransactionDetailsSection
        vault={vault}
        amountToBorrowInToken={new BigNumber(amountToAdd.amountInToken)}
        resultingColRatio={resultingColRatio}
        vaultInterestRate={new BigNumber(vault.loanScheme.interestRate)}
        loanTokenInterestRate={new BigNumber(loanToken.interest)}
        loanTokenDisplaySymbol={loanToken.token.displaySymbol}
        totalInterestAmount={totalAnnualInterest}
        totalLoanWithInterest={totalLoanWithInterest}
        loanTokenPrice={new BigNumber(getActivePrice(loanToken.token.symbol, loanToken.activePrice))}
        fee={fee}
      />
      <Button
        disabled={!valid || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
        label={translate('screens/BorrowMoreScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='borrow_more_button'
        margin='mt-12 mb-2 mx-4'
      />
      <ThemedText
        light={tailwind('text-gray-500', { 'text-error-500': inputValidationMessage !== '' })}
        dark={tailwind('text-gray-400', { 'text-darkerror-500': inputValidationMessage !== '' })}
        style={tailwind('text-center text-xs mb-12')}
      >
        {inputValidationMessage === ''
          ? translate('screens/BorrowMoreScreen', 'Review and confirm transaction in the next screen')
          : translate('screens/BorrowMoreScreen', 'Unable to proceed because of errors')}
      </ThemedText>
    </ThemedScrollView>
  )
}

interface VaultInputProps {
  vault: LoanVaultActive
  loanToken?: LoanToken
  displayMaxLoanAmount?: boolean
  interestPerBlock?: BigNumber
}

export function VaultInput ({
  vault,
  loanToken,
  displayMaxLoanAmount = false,
  interestPerBlock
}: VaultInputProps): JSX.Element {
  const vaultState = useVaultStatus(vault.state, new BigNumber(vault.collateralRatio), new BigNumber(vault.loanScheme.minColRatio), new BigNumber(vault.loanValue), new BigNumber(vault.collateralValue))
  const colors = useCollateralizationRatioColor({
    colRatio: new BigNumber(vault.collateralRatio),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(vault.loanValue),
    totalCollateralValue: new BigNumber(vault.collateralValue)
  })

  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  const minCollateralRatioInfo = {
    title: 'Min. collateralization ratio',
    message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
  }

  const maxLoanAmount = useMaxLoanAmount({
    totalCollateralValue: new BigNumber(vault.collateralValue),
    existingLoanValue: new BigNumber(vault.loanValue),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    loanActivePrice: new BigNumber(getActivePrice(loanToken?.token.symbol ?? '', loanToken?.activePrice)),
    interestPerBlock: interestPerBlock ?? new BigNumber(NaN)
  })

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-col rounded-lg mb-4')}
    >
      <View style={tailwind('flex flex-row justify-between items-center mb-2')}>
        <View>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode='middle'
            style={tailwind('mr-2 w-56 flex-shrink text-sm font-medium')}
            testID='vault_id'
          >
            {vault.vaultId}
          </ThemedText>
        </View>
        <VaultStatusTag status={vaultState.status} testID='vault_status_tag' />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1 mt-2')}>
        <View style={tailwind('items-center flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs mr-1')}
          >
            {translate('screens/PaybackLoanScreen', 'Collateralization ratio')}
          </ThemedText>
          <BottomSheetInfo
            alertInfo={collateralAlertInfo} name={collateralAlertInfo.title}
            infoIconStyle={tailwind('text-xs')}
          />
        </View>
        <NumberFormat
          value={new BigNumber(vault.collateralRatio === '-1' ? NaN : vault.collateralRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix={vault.collateralRatio === '-1' ? translate('screens/PaybackLoanScreen', 'N/A') : '%'}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              testID='loan_col_ratio' light={colors.light} dark={colors.dark}
              style={tailwind('text-sm font-medium')}
            >
              {value}
            </ThemedText>
          )}
        />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1')}>
        <View style={tailwind('items-center flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs mr-1')}
          >
            {translate('screens/PaybackLoanScreen', 'Min. collateralization ratio')}
          </ThemedText>
          <BottomSheetInfo
            alertInfo={minCollateralRatioInfo} name={minCollateralRatioInfo.title}
            infoIconStyle={tailwind('text-xs')}
          />
        </View>
        <NumberFormat
          value={new BigNumber(vault.loanScheme.minColRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) => (
            <ThemedText testID='loan_min_col' style={tailwind('text-sm font-medium')}>
              {value}
            </ThemedText>
          )}
        />
      </View>
      {displayMaxLoanAmount && loanToken !== undefined &&
        (
          <View style={tailwind('flex flex-row items-center justify-between mb-1')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs')}
            >
              {translate('screens/PaybackLoanScreen', 'Max loan amount')}
            </ThemedText>
            <NumberFormat
              value={maxLoanAmount.isNaN() ? translate('screens/PaybackLoanScreen', 'N/A') : maxLoanAmount.toFixed(8)}
              decimalScale={8}
              thousandSeparator
              suffix={` ${loanToken.token.displaySymbol}`}
              displayType='text'
              renderText={(value) =>
                <ThemedText style={tailwind('text-sm font-medium')}>
                  {value}
                </ThemedText>}
            />
          </View>
        )}
    </ThemedView>
  )
}

interface LoanTokenInputProps {
  loanTokenId: string
  displaySymbol: string
  price?: ActivePrice
  outstandingBalance: BigNumber
}

function LoanTokenInput (props: LoanTokenInputProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-col rounded-lg')}
    >
      <View style={tailwind('flex flex-row items-center mb-3')}>
        <SymbolIcon
          symbol={props.displaySymbol} styleProps={tailwind('w-6 h-6')}
        />
        <ThemedText testID='loan_symbol' style={tailwind('ml-2 font-medium')}>{props.displaySymbol}</ThemedText>
      </View>
      <View style={tailwind('flex flex-row items-center justify-between')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/PaybackLoanScreen', 'Outstanding balance')}
        </ThemedText>
        <NumberFormat
          value={new BigNumber(props.outstandingBalance).toFixed(8)}
          decimalScale={8}
          thousandSeparator
          suffix={` ${props.displaySymbol}`}
          displayType='text'
          renderText={(value) =>
            <ThemedText testID='loan_outstanding_balance' style={tailwind('text-sm font-medium')}>
              {value}
            </ThemedText>}
        />
      </View>
    </ThemedView>
  )
}
