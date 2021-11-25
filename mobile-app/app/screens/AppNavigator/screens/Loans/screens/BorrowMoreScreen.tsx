import { View } from '@components'
import { ThemedScrollView, ThemedSectionTitle, ThemedText } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React, { useEffect, useState } from 'react'
import { LoanParamList } from '../LoansNavigator'
import { LoanTokenInput, VaultInput } from './PaybackLoanScreen'
import BigNumber from 'bignumber.js'
import { WalletTextInput } from '@components/WalletTextInput'
import { TransactionDetailsSection } from './BorrowLoanTokenScreen'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { loanTokenByTokenId, vaultsSelector } from '@store/loans'
import { Button } from '@components/Button'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useLoanOperations } from '../hooks/LoanOperations'

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
  const [amountToAdd, setAmountToAdd] = useState('')
  const [totalInterestAmount, setTotalInterestAmount] = useState(new BigNumber(NaN))
  const [totalLoanWithInterest, setTotalLoanWithInterest] = useState(new BigNumber(NaN))
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [valid, setValid] = useState(false)
  const resultingColRatio = useResultingCollateralRatio(new BigNumber(vault?.collateralValue ?? NaN), new BigNumber(vault?.loanValue ?? NaN),
  new BigNumber(totalLoanWithInterest), new BigNumber(loanTokenAmount.activePrice?.active?.amount ?? 0))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const canUseOperations = useLoanOperations(vault?.state)

  // Form update
  const [inputValidationMessage, setInputValidationMessage] = useState('')
  const isFormValid = (): boolean => {
    const amount = new BigNumber(amountToAdd)
    return !(amount.isNaN() ||
      amount.isLessThanOrEqualTo(0) ||
      vault === undefined ||
      resultingColRatio === undefined ||
      resultingColRatio.isLessThan(vault.loanScheme.minColRatio))
  }

  const updateInterestAmount = (): void => {
    if (vault === undefined || amountToAdd === undefined || loanToken?.activePrice?.active?.amount === undefined) {
      return
    }
    const vaultInterestRate = new BigNumber(vault.loanScheme.interestRate).div(100)
    const loanTokenInterestRate = new BigNumber(loanToken.interest).div(100)
    setTotalInterestAmount(new BigNumber(amountToAdd).multipliedBy(vaultInterestRate.plus(loanTokenInterestRate)))
    setTotalLoanWithInterest(new BigNumber(amountToAdd).multipliedBy(vaultInterestRate.plus(loanTokenInterestRate).plus(1)))
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
        amountToBorrow: amountToAdd,
        totalInterestAmount,
        totalLoanWithInterest,
        fee
      }
    })
  }

  const validateInput = (): void => {
    const amount = new BigNumber(amountToAdd)
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
        <VaultInput vault={vault} loanToken={loanToken} displayMaxLoanAmount />
      </View>
      <View style={tailwind('mt-2 mb-12 px-4')}>
        <WalletTextInput
          inputType='numeric'
          value={amountToAdd}
          title={translate('screens/BorrowMoreScreen', 'How much do you want to add?')}
          placeholder={translate('screens/BorrowMoreScreen', 'Enter an amount')}
          onChangeText={(text) => setAmountToAdd(text)}
          displayClearButton={amountToAdd !== ''}
          onClearButtonPress={() => setAmountToAdd('')}
          valid={inputValidationMessage === ''}
          inlineText={{
            type: 'error',
            text: translate('screens/BorrowMoreScreen', inputValidationMessage)
          }}
          style={tailwind('h-9 w-3/5 flex-grow')}
        />
      </View>
      <TransactionDetailsSection
        vault={vault}
        amountToBorrow={new BigNumber(amountToAdd)}
        resultingColRatio={resultingColRatio}
        vaultInterestRate={new BigNumber(vault.loanScheme.interestRate)}
        loanTokenInterestRate={new BigNumber(loanToken.interest)}
        loanTokenDisplaySymbol={loanToken.token.displaySymbol}
        totalInterestAmount={totalInterestAmount}
        totalLoanWithInterest={totalLoanWithInterest}
        loanTokenPrice={new BigNumber(loanToken.activePrice?.active?.amount ?? 0)}
        fee={fee}
      />
      <Button
        disabled={!valid || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
        label={translate('screens/BorrowMoreScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='add_collateral_button'
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
