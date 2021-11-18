import { FeeInfoRow } from '@components/FeeInfoRow'
import { NumberRow } from '@components/NumberRow'
import { SummaryTitle } from '@components/SummaryTitle'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LoanParamList } from '../LoansNavigator'
import { StackScreenProps } from '@react-navigation/stack'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { fetchVaults } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { ConversionParam } from '../../Balances/BalancesNavigator'
import { ConversionTag } from '@components/ConversionTag'

type Props = StackScreenProps<LoanParamList, 'ConfirmBorrowLoanTokenScreen'>

export function ConfirmBorrowLoanTokenScreen ({ route, navigation }: Props): JSX.Element {
  const {
    loanToken,
    vault,
    amountToBorrow,
    totalInterestAmount,
    totalLoanWithInterest,
    fee,
    conversion
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const dispatch = useDispatch()
  const logger = useLogger()
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
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
    await borrowLoanToken({
      vaultId: vault.vaultId,
      loanToken: loanToken,
      amountToBorrow: new BigNumber(amountToBorrow)
    }, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, () => {
      dispatch(fetchVaults({
        address,
        client
      }))
    }, logger)
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM BORROW'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'BORROWING'
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  return (
    <ThemedScrollView>
      <SummaryHeader
        amount={new BigNumber(amountToBorrow)}
        displaySymbol={loanToken.token.displaySymbol}
        conversion={conversion}
      />
      <SummaryTransactionDetails
        amountToBorrow={amountToBorrow}
        displaySymbol={loanToken.token.displaySymbol}
        loanTokenInterest={loanToken.interest}
        vaultInterest={vault.loanScheme.interestRate}
        totalInterestAmount={totalInterestAmount}
        totalLoanWithInterest={totalLoanWithInterest}
        fee={fee}
        conversion={conversion}
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

function SummaryHeader (props: {amount: BigNumber, displaySymbol: string, conversion?: ConversionParam}): JSX.Element {
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
      {props.conversion?.isConversionRequired === true && <ConversionTag />}
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
  conversion?: ConversionParam
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
          value: props.conversion?.isConversionRequired === true ? translate('screens/ConfirmBorrowLoanTokenScreen', 'Convert & borrow loan token') : translate('screens/ConfirmBorrowLoanTokenScreen', 'Borrow loan token'),
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

interface BorrowForm {
  vaultId: string
  amountToBorrow: BigNumber
  loanToken: LoanToken
}
async function borrowLoanToken ({
  vaultId,
  amountToBorrow,
  loanToken
}: BorrowForm, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      const signed = await builder.loans.takeLoan({
        vaultId: vaultId,
        to: script,
        tokenAmounts: [{
          token: +loanToken.token.id,
          amount: amountToBorrow
        }]
      }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmBorrowLoanTokenScreen', 'Borrowing loan token'),
      description: translate('screens/ConfirmBorrowLoanTokenScreen', 'Borrowing {{amount}} {{symbol}}', {
        amount: amountToBorrow.toFixed(8),
        symbol: loanToken.token.displaySymbol
      }),
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
