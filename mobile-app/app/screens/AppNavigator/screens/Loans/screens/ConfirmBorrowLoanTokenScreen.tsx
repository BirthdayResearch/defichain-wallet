import { FeeInfoRow } from '@components/FeeInfoRow'
import { NumberRow } from '@components/NumberRow'
import { SummaryTitle } from '@components/SummaryTitle'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LoanParamList } from '../LoansNavigator'
import { StackScreenProps } from '@react-navigation/stack'

type Props = StackScreenProps<LoanParamList, 'ConfirmBorrowLoanTokenScreen'>

export function ConfirmBorrowLoanTokenScreen ({ route, navigation }: Props): JSX.Element {
  const {
    loanToken,
    vault,
    amountToBorrow,
    totalInterestAmount,
    totalLoanWithInterest,
    fee
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const resultCollateralRatio = new BigNumber(vault.collateralValue).dividedBy(
    new BigNumber(vault.loanValue).plus(totalLoanWithInterest.multipliedBy(
      loanToken.activePrice?.active?.amount ?? 0))).multipliedBy(100)

  function onCancel (): void {
    navigation.navigate({
      name: 'BorrowLoanTokenScreen',
      params: {
        loanToken,
        vault
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    // TODO: create signer to take loan token, remove custom navigation below
    navigation.navigate({
      name: 'VaultDetailScreen',
      params: {
        vaultId: vault.vaultId,
        emptyActiveLoans: false
      },
      merge: true
    })
  }

  function getSubmitLabel (): string {
    if (hasPendingBroadcastJob || hasPendingJob) {
      return 'BORROWING'
    }
    return 'CONFIRM BORROW'
  }

  return (
    <ThemedScrollView>
      <SummaryHeader amount={new BigNumber(amountToBorrow)} displaySymbol={loanToken.token.displaySymbol} />
      <SummaryTransactionDetails
        amountToBorrow={amountToBorrow}
        displaySymbol={loanToken.token.displaySymbol}
        loanTokenInterest={loanToken.interest}
        vaultInterest={vault.loanScheme.interestRate}
        totalInterestAmount={totalInterestAmount}
        totalLoanWithInterest={totalLoanWithInterest}
        fee={fee}
      />
      <SummaryVaultDetails
        vaultId={vault.vaultId}
        collateralAmount={new BigNumber(vault.collateralValue)}
        collateralRatio={new BigNumber(vault.collateralRatio)}
      />
      <SummaryTransactionResults
        resultCollateralRatio={resultCollateralRatio}
      />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob || resultCollateralRatio.isLessThan(vault.loanScheme.minColRatio)}
        label={translate('screens/ConfirmBorrowLoanTokenScreen', 'CONFIRM BORROW')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmBorrowLoanTokenScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='create_vault'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: {amount: BigNumber, displaySymbol: string}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-300')}
      style={tailwind('flex-col px-4 py-8')}
    >
      <SummaryTitle
        amount={props.amount}
        suffix={props.displaySymbol}
        suffixType='text'
        testID='text_borrow_amount'
        title={translate('screens/ConfirmBorrowLoanTokenScreen', 'You are borrowing')}
      />
    </ThemedView>
  )
}

interface SummaryTransactionDetailsProps {
  amountToBorrow: string
  displaySymbol: string
  loanTokenInterest: string
  vaultInterest: string
  totalInterestAmount: BigNumber
  totalLoanWithInterest: BigNumber
  fee: BigNumber
}

function SummaryTransactionDetails (props: SummaryTransactionDetailsProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmBorrowLoanTokenScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmBorrowLoanTokenScreen', 'Borrow loan token'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Loan tokens to borrow')}
        rhs={{
          value: props.amountToBorrow,
          testID: 'tokens_to_borrow',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Token interest')}
        rhs={{
          value: props.loanTokenInterest,
          testID: 'token_interest',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Vault interest')}
        rhs={{
          value: props.vaultInterest,
          testID: 'vault_interest',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Total interest amount')}
        rhs={{
          value: props.totalInterestAmount.toFixed(8),
          testID: 'total_interest_amount',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Total loan + interest')}
        rhs={{
          value: props.totalLoanWithInterest.toFixed(8),
          testID: 'total_loan_with_interest',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='estimated_fee'
        suffix='DFI'
      />
    </>
  )
}

function SummaryVaultDetails (props: {vaultId: string, collateralAmount: BigNumber, collateralRatio: BigNumber}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmBorrowLoanTokenScreen', 'VAULT DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Vault ID')}
        rhs={{
          value: props.vaultId,
          testID: 'text_vault_id'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Collateral amount (USD)')}
        rhs={{
          value: props.collateralAmount.toFixed(2),
          testID: 'text_collateral_amount'
        }}
      />
      {props.collateralRatio.isLessThan(0)
        ? (
          <TextRow
            lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Collateralization ratio')}
            rhs={{
              value: translate('screens/ConfirmBorrowLoanTokenScreen', 'N/A'),
              testID: 'text_current_collateral_ratio'
            }}
            textStyle={tailwind('text-sm font-normal')}
          />
        )
      : (
        <NumberRow
          lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Collateralization ratio')}
          rhs={{
            value: props.collateralRatio.toFixed(2),
            testID: 'text_current_collateral_ratio',
            suffixType: 'text',
            suffix: '%'
          }}
        />
      )}
    </>
  )
}

function SummaryTransactionResults (props: {resultCollateralRatio: BigNumber}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmBorrowLoanTokenScreen', 'TRANSACTION RESULTS')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Resulting collateral ratio')}
        rhs={{
          value: props.resultCollateralRatio.toFixed(2),
          testID: 'text_result_collateral_ratio',
          suffixType: 'text',
          suffix: '%'
        }}
      />
    </>
  )
}
