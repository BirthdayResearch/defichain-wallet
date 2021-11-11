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
  const { loan } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const amount = new BigNumber(0.000123123)
  const displaySymbol = 'dTSLA'
  const loansTransactionDetails = {
    loanTokenAmount: new BigNumber('0.000123123'),
    loanTokenDisplaySymbol: 'dTSLA',
    loanTokenInterest: new BigNumber('1.5312'),
    vaultInterest: new BigNumber('1'),
    totalInterestAmount: new BigNumber('0.00000012312'),
    paybackAmount: new BigNumber('0.000124'),
    fee: new BigNumber('0.1')
  }
  const vaultId = '22ffasd5ca123123123123123121231061'
  const collateralAmount = new BigNumber(923234)
  const currentCollateralRatio = new BigNumber(193)
  const resultCollateralRatio = new BigNumber('1231.3123')

  function onCancel (): void {
    navigation.navigate({
      name: 'BorrowLoanTokenScreen',
      params: {
        loan
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    // TODO: create signer to take loan token, remove custom navigation below
    navigation.navigate({
      name: 'VaultDetailScreen',
      params: {
        vaultId: vaultId,
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
      <SummaryHeader amount={amount} displaySymbol={displaySymbol} />
      <SummaryTransactionDetails {...loansTransactionDetails} />
      <SummaryVaultDetails vaultId={vaultId} collateralAmount={collateralAmount} collateralRatio={currentCollateralRatio} />
      <SummaryTransactionResults resultCollateralRatio={resultCollateralRatio} />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
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
  loanTokenAmount: BigNumber
  loanTokenDisplaySymbol: string
  loanTokenInterest: BigNumber
  vaultInterest: BigNumber
  totalInterestAmount: BigNumber
  paybackAmount: BigNumber
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
          value: props.loanTokenAmount.toFixed(8),
          testID: 'tokens_to_borrow',
          suffixType: 'text',
          suffix: props.loanTokenDisplaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Token interest')}
        rhs={{
          value: props.loanTokenInterest.toFixed(2),
          testID: 'token_interest',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Vault interest')}
        rhs={{
          value: props.vaultInterest.toFixed(2),
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
          suffix: props.loanTokenDisplaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Loan tokens to payback')}
        rhs={{
          value: props.paybackAmount.toFixed(8),
          testID: 'payback_amount',
          suffixType: 'text',
          suffix: props.loanTokenDisplaySymbol
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
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Current collateral ratio')}
        rhs={{
          value: props.collateralRatio.toFixed(2),
          testID: 'text_current_collateral_ratio',
          suffixType: 'text',
          suffix: '%'
        }}
      />
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
