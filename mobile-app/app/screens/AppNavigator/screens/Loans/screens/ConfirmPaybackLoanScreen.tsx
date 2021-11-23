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
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LoanParamList } from '../LoansNavigator'
import { StackScreenProps } from '@react-navigation/stack'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { LoanVaultActive, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { fetchVaults } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { ConversionParam } from '../../Balances/BalancesNavigator'
import { useCollateralizationRatioColor } from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'

type Props = StackScreenProps<LoanParamList, 'ConfirmPaybackLoanScreen'>

export function ConfirmPaybackLoanScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const {
    vault,
    amountToPay,
    fee,
    loanToken
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const logger = useLogger()
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

  function onCancel (): void {
    navigation.navigate({
      name: 'PaybackLoanScreen',
      params: {
        loanToken,
        vault
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    await paybackLoanToken({
      vaultId: vault.vaultId,
      loanToken: loanToken,
      amountToPay
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
      return 'CONFIRM PAYMENT'
    }
    return 'PAYING'
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
        amount={new BigNumber(amountToPay)}
        displaySymbol={loanToken.displaySymbol}
      />
      <SummaryTransactionDetails
        amountToPay={amountToPay}
        displaySymbol={loanToken.displaySymbol}
        fee={fee}
        vault={vault}
        outstandingBalance={new BigNumber(loanToken.amount).minus(amountToPay)}
      />
      <SummaryVaultDetails
        vault={vault}
      />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmPaybackLoanScreen', 'CONFIRM PAYMENT')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmPaybackLoanScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='payback_loan'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: { amount: BigNumber, displaySymbol: string, conversion?: ConversionParam }): JSX.Element {
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
        testID='text_payment_amount'
        title={translate('screens/ConfirmPaybackLoanScreen', 'You are paying')}
      />
    </ThemedView>
  )
}

interface SummaryTransactionDetailsProps {
  amountToPay: BigNumber
  outstandingBalance: BigNumber
  displaySymbol: string
  fee: BigNumber
  vault: LoanVaultActive
}

function SummaryTransactionDetails (props: SummaryTransactionDetailsProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmPaybackLoanScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmPaybackLoanScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmPaybackLoanScreen', 'Loan payment'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmPaybackLoanScreen', 'Amount to pay')}
        rhs={{
          value: props.amountToPay.toFixed(8),
          testID: 'tokens_to_pay',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Remaining loan amount')}
        rhs={{
          value: props.outstandingBalance.toFixed(8),
          testID: 'text_resulting_loan_amount',
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

function SummaryVaultDetails (props: { vault: LoanVaultActive }): JSX.Element {
  const colRatio = new BigNumber(props.vault.collateralRatio)
  const colors = useCollateralizationRatioColor({
    colRatio,
    minColRatio: new BigNumber(props.vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(props.vault.loanValue)
  })
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmPaybackLoanScreen', 'VAULT DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmPaybackLoanScreen', 'Vault ID')}
        rhs={{
          value: props.vault.vaultId,
          testID: 'text_vault_id'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmPaybackLoanScreen', 'Collateral amount (USD)')}
        rhs={{
          value: new BigNumber(props.vault.collateralValue).toFixed(2),
          testID: 'text_collateral_amount'
        }}
      />
      {colRatio.isLessThan(0)
        ? (
          <TextRow
            lhs={translate('screens/ConfirmPaybackLoanScreen', 'Collateralization ratio')}
            rhs={{
              value: translate('screens/ConfirmPaybackLoanScreen', 'N/A'),
              testID: 'text_current_collateral_ratio'
            }}
            textStyle={tailwind('text-sm font-normal')}
          />
        )
        : (
          <NumberRow
            lhs={translate('screens/ConfirmPaybackLoanScreen', 'Collateralization ratio')}
            rhs={{
              value: colRatio.toFixed(2),
              testID: 'text_current_collateral_ratio',
              suffixType: 'text',
              suffix: '%'
            }}
            rhsThemedProps={colors}
          />
        )}
    </>
  )
}

interface PaybackForm {
  vaultId: string
  amountToPay: BigNumber
  loanToken: LoanVaultTokenAmount
}

async function paybackLoanToken ({
  vaultId,
  amountToPay,
  loanToken
}: PaybackForm, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      const signed = await builder.loans.paybackLoan({
        vaultId: vaultId,
        from: script,
        tokenAmounts: [{
          token: +loanToken.id,
          amount: amountToPay
        }]
      }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmPaybackLoanScreen', 'Paying loan'),
      description: translate('screens/ConfirmPaybackLoanScreen', 'Paying {{amount}} {{symbol}}', {
        amount: amountToPay.toFixed(8),
        symbol: loanToken.displaySymbol
      }),
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
