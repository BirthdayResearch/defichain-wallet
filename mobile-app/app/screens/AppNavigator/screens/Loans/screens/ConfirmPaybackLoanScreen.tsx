import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { InfoText } from '@components/InfoText'
import { NumberRow } from '@components/NumberRow'
import { SummaryTitle } from '@components/SummaryTitle'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { Dispatch, useEffect, useState } from 'react'
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
import { WalletAddressRow } from '@components/WalletAddressRow'
import { CollateralizationRatioRow } from '../components/CollateralizationRatioRow'
import { PaymentTokenProps } from '../hooks/LoanPaymentTokenRate'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

type Props = StackScreenProps<LoanParamList, 'ConfirmPaybackLoanScreen'>

export function ConfirmPaybackLoanScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const {
    vault,
    amountToPayInLoanToken,
    amountToPayInPaymentToken,
    selectedPaymentTokenBalance,
    loanTokenBalance,
    paymentToken,
    fee,
    loanTokenAmount,
    excessAmount,
    resultingColRatio,
    conversion,
    paymentPenalty
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const logger = useLogger()
  const { address } = useWalletContext()
  const { isFeatureAvailable } = useFeatureFlagContext()
  const client = useWhaleApiClient()
  const isDUSDPaymentEnabled = isFeatureAvailable('dusd_loan_payment')
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

  function onCancel (): void {
    navigation.navigate({
      name: 'PaybackLoanScreen',
      params: {
        loanTokenAmount,
        vault
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    await paybackLoanToken({
      vaultId: vault.vaultId,
      loanToken: loanTokenAmount,
      amountToPayInLoanToken,
      amountToPayInPaymentToken,
      selectedPaymentTokenBalance,
      loanTokenBalance,
      paymentToken,
      paymentPenalty,
      isDUSDPaymentEnabled
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
        amount={new BigNumber(amountToPayInLoanToken)}
        displaySymbol={loanTokenAmount.displaySymbol}
        amountToPayInPaymentToken={amountToPayInPaymentToken}
        paymentToken={paymentToken}
      />
      <SummaryTransactionDetails
        amountToPayInLoanToken={amountToPayInLoanToken}
        amountToPayInPaymentToken={amountToPayInPaymentToken}
        displaySymbol={loanTokenAmount.displaySymbol}
        fee={fee}
        vault={vault}
        outstandingBalance={BigNumber.max(new BigNumber(loanTokenAmount.amount).minus(amountToPayInLoanToken), 0)}
        excessAmount={excessAmount}
        paymentPenalty={paymentPenalty}
        paymentTokenDisplaySymbol={paymentToken.tokenDisplaySymbol}
      />
      <SummaryVaultDetails
        vault={vault}
        resultingColRatio={resultingColRatio}
      />
      {conversion?.isConversionRequired === true && (
        <View style={tailwind('px-4 pt-2 pb-1 mt-2')}>
          <InfoText
            type='warning'
            testID='conversion_warning_info_text'
            text={translate('components/ConversionInfoText', 'Please wait as we convert tokens for your transaction. Conversions are irreversible.')}
          />
        </View>
      )}
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmPaybackLoanScreen', 'CONFIRM PAYMENT')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmPaybackLoanScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='payback_loan'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: { amount: BigNumber, paymentToken: Omit<PaymentTokenProps, 'tokenBalance'>, amountToPayInPaymentToken: BigNumber, displaySymbol: string, conversion?: ConversionParam }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-300')}
      style={tailwind('flex-col px-4 py-8')}
    >
      <SummaryTitle
        amount={props.amountToPayInPaymentToken}
        suffix={props.paymentToken.tokenDisplaySymbol}
        suffixType='text'
        testID='text_payment_amount'
        title={translate('screens/ConfirmPaybackLoanScreen', 'You are paying')}
      />
      {props.paymentToken.tokenDisplaySymbol !== props.displaySymbol &&
        <View style={tailwind('flex flex-row')}>
          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) => (
              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
                style={tailwind('text-sm pr-1')}
              >
                {value}
              </ThemedText>
            )}
            thousandSeparator
            value={props.amount.toFixed(8)}
          />
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-sm')}
          >
            {props.displaySymbol}
          </ThemedText>
        </View>}
    </ThemedView>
  )
}

interface SummaryTransactionDetailsProps {
  amountToPayInLoanToken: BigNumber
  amountToPayInPaymentToken: BigNumber
  outstandingBalance: BigNumber
  displaySymbol: string
  fee: BigNumber
  vault: LoanVaultActive
  excessAmount?: BigNumber
  paymentPenalty: BigNumber
  paymentTokenDisplaySymbol: string
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
      <WalletAddressRow />
      <NumberRow
        lhs={translate('screens/ConfirmPaybackLoanScreen', 'Amount to pay')}
        rhs={{
          value: props.amountToPayInPaymentToken.toFixed(8),
          testID: 'tokens_to_pay',
          suffixType: 'text',
          suffix: props.paymentTokenDisplaySymbol
        }}
      />
      {props.excessAmount !== undefined &&
        (
          <NumberRow
            lhs={translate('screens/PaybackLoanScreen', 'Excess amount')}
            rhs={{
              value: props.excessAmount.toFixed(8),
              testID: 'text_excess_amount',
              suffixType: 'text',
              suffix: props.paymentTokenDisplaySymbol
            }}
          />
        )}
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Remaining loan amount')}
        rhs={{
          value: props.outstandingBalance.toFixed(8),
          testID: 'text_resulting_loan_amount',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      {props.paymentPenalty.gt(0) &&
        <NumberRow
          lhs={translate('screens/PaybackLoanScreen', '{{paymentToken}} payment fee', { paymentToken: props.paymentTokenDisplaySymbol })}
          rhs={{
            value: BigNumber.max(props.paymentPenalty, 0).toFixed(8),
            testID: 'text_resulting_payment_penalty',
            suffixType: 'text',
            suffix: props.paymentTokenDisplaySymbol
          }}
        />}
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='estimated_fee'
        suffix='DFI'
      />
    </>
  )
}

function SummaryVaultDetails (props: { vault: LoanVaultActive, resultingColRatio: BigNumber }): JSX.Element {
  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmPaybackLoanScreen', 'VAULT DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmPaybackLoanScreen', 'Vault ID')}
        rhs={{
          value: props.vault.vaultId,
          testID: 'text_vault_id',
          numberOfLines: 1,
          ellipsizeMode: 'middle'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      {props.resultingColRatio.isLessThan(0)
        ? (
          <TextRow
            lhs={translate('screens/ConfirmPaybackLoanScreen', 'Resulting collateralization')}
            rhs={{
              value: translate('screens/ConfirmPaybackLoanScreen', 'N/A'),
              testID: 'text_current_collateral_ratio'
            }}
            textStyle={tailwind('text-sm font-normal')}
            info={collateralAlertInfo}
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('screens/ConfirmPaybackLoanScreen', 'Resulting collateralization')}
            value={props.resultingColRatio.toFixed(2)}
            testId='text_resulting_col_ratio'
            type='current'
            minColRatio={new BigNumber(props.vault.loanScheme.minColRatio)}
            totalLoanAmount={new BigNumber(props.vault.loanValue)}
            colRatio={props.resultingColRatio}
          />
        )}
    </>
  )
}

interface PaybackForm {
  vaultId: string
  amountToPayInLoanToken: BigNumber
  amountToPayInPaymentToken: BigNumber
  selectedPaymentTokenBalance: BigNumber
  loanTokenBalance: BigNumber
  paymentToken: Omit<PaymentTokenProps, 'tokenBalance'>
  loanToken: LoanVaultTokenAmount
  paymentPenalty: BigNumber
  isDUSDPaymentEnabled: boolean
}

async function paybackLoanToken ({
  vaultId,
  amountToPayInLoanToken,
  amountToPayInPaymentToken,
  selectedPaymentTokenBalance,
  loanTokenBalance,
  paymentToken,
  loanToken,
  paymentPenalty,
  isDUSDPaymentEnabled
}: PaybackForm, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      const signed = isDUSDPaymentEnabled
        ? await builder.loans.paybackLoanV2({
          vaultId: vaultId,
          from: script,
          loans: [{
            dToken: +loanToken.id,
            amounts: [{
              token: paymentToken.tokenId === '0_unified' ? 0 : +paymentToken.tokenId,
              amount: BigNumber.min(selectedPaymentTokenBalance, amountToPayInPaymentToken.plus(paymentPenalty))
            }]
          }]
        }, script)
        : await builder.loans.paybackLoan({
          vaultId: vaultId,
          from: script,
          tokenAmounts: [{
            token: paymentToken.tokenId === '0_unified' ? 0 : +paymentToken.tokenId,
            amount: BigNumber.min(selectedPaymentTokenBalance, amountToPayInPaymentToken.plus(paymentPenalty))
          }]
        }, script)
      return new CTransactionSegWit(signed)
    }

    const textToTranslate =
      paymentToken.tokenDisplaySymbol === loanToken.displaySymbol
        ? 'Paying {{amountToPayInPaymentToken}} {{paymentSymbol}} as loan payment.'
        : 'Paying {{amountToPayInPaymentToken}} {{paymentSymbol}} ({{amountToPayInLoanToken}} {{symbol}}) as loan payment.'

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmPaybackLoanScreen', 'Paying loan'),
      description: translate('screens/ConfirmPaybackLoanScreen', textToTranslate, {
        amountToPayInLoanToken: BigNumber.min(loanTokenBalance, amountToPayInLoanToken).toFixed(8),
        amountToPayInPaymentToken: BigNumber.min(selectedPaymentTokenBalance, amountToPayInPaymentToken).toFixed(8),
        symbol: loanToken.displaySymbol,
        paymentSymbol: paymentToken.tokenDisplaySymbol
      }),
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
