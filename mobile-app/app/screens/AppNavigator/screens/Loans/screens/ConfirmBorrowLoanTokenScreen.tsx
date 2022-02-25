import { FeeInfoRow } from '@components/FeeInfoRow'
import { NumberRow } from '@components/NumberRow'
import { SummaryTitle } from '@components/SummaryTitle'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { Dispatch, useEffect, useState } from 'react'
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
import { WalletAddressRow } from '@components/WalletAddressRow'
import { CollateralizationRatioRow } from '../components/CollateralizationRatioRow'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'

type Props = StackScreenProps<LoanParamList, 'ConfirmBorrowLoanTokenScreen'>

export function ConfirmBorrowLoanTokenScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const {
    loanToken,
    vault,
    amountToBorrow,
    totalInterestAmount,
    totalLoanWithInterest,
    fee,
    resultingColRatio
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const dispatch = useDispatch()
  const logger = useLogger()
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

  function onCancel (): void {
    navigation.goBack()
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
      />
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
        resultCollateralRatio={resultingColRatio}
        minColRatio={new BigNumber(vault.loanScheme.minColRatio)}
        totalLoanValue={new BigNumber(vault.loanValue).plus(
          totalLoanWithInterest.multipliedBy(
            getActivePrice(loanToken.token.symbol, loanToken.activePrice)
          )
        )}
      />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmBorrowLoanTokenScreen', 'CONFIRM BORROW')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmBorrowLoanTokenScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='borrow_loan'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: { amount: BigNumber, displaySymbol: string }): JSX.Element {
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
      <WalletAddressRow />
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
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Vault interest')}
        rhs={{
          value: props.vaultInterest,
          testID: 'vault_interest',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
        info={{
          title: 'Annual vault interest',
          message: 'Annual vault interest rate based on the loan scheme selected.'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Estimated annual interest')}
        rhs={{
          value: props.totalInterestAmount.toFixed(8),
          testID: 'estimated_annual_interest',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Total loan + annual interest')}
        rhs={{
          value: props.totalLoanWithInterest.toFixed(8),
          testID: 'total_loan_with_annual_interest',
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

function SummaryVaultDetails (props: { vaultId: string, collateralAmount: BigNumber, collateralRatio: BigNumber }): JSX.Element {
  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmBorrowLoanTokenScreen', 'VAULT DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Vault ID')}
        rhs={{
          value: props.vaultId,
          testID: 'text_vault_id',
          numberOfLines: 1,
          ellipsizeMode: 'middle'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Collateral amount (USD)')}
        rhs={{
          value: getUSDPrecisedPrice(props.collateralAmount),
          testID: 'text_collateral_amount',
          prefix: '$'
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
            info={collateralAlertInfo}
          />
        )
        : (
          <NumberRow
            lhs={translate('screens/ConfirmBorrowLoanTokenScreen', 'Collateralization ratio')}
            rhs={{
              value: props.collateralRatio.toFixed(2),
              testID: 'text_current_collateral_ratio',
              suffixType: 'text',
              suffix: '%',
              style: tailwind('ml-0')
            }}
            info={collateralAlertInfo}
          />
        )}
    </>
  )
}

function SummaryTransactionResults (props: { resultCollateralRatio: BigNumber, minColRatio: BigNumber, totalLoanValue: BigNumber }): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmBorrowLoanTokenScreen', 'TRANSACTION RESULTS')}
      />
      <CollateralizationRatioRow
        label={translate('screens/ConfirmBorrowLoanTokenScreen', 'Resulting collateralization')}
        value={props.resultCollateralRatio.toFixed(2)}
        testId='text_resulting_col_ratio'
        type='current'
        minColRatio={props.minColRatio}
        totalLoanAmount={props.totalLoanValue}
        colRatio={props.resultCollateralRatio}
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
