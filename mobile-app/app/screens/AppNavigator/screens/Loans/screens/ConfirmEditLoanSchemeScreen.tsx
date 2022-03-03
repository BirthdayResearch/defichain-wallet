import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Dispatch, useEffect, useState } from 'react'
import { LoanParamList } from '../LoansNavigator'
import BigNumber from 'bignumber.js'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LoanScheme } from '@defichain/whale-api-client/dist/api/loan'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { WalletAddressRow } from '@components/WalletAddressRow'

type Props = StackScreenProps<LoanParamList, 'ConfirmEditLoanSchemeScreen'>

export function ConfirmEditLoanSchemeScreen ({ route, navigation }: Props): JSX.Element {
  const {
    vault,
    loanScheme,
    fee
  } = route.params

  // Submit
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const dispatch = useDispatch()
  const logger = useLogger()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

  function onCancel (): void {
    navigation.navigate({
      name: 'EditLoanSchemeScreen',
      params: {
        vaultId: vault.vaultId
      },
      merge: true
    })
  }
  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    await editLoanScheme({
      vaultId: vault.vaultId,
      loanScheme
    }, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, () => {

    }, logger)
  }
  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM EDIT'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'EDITING'
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  return (
    <ThemedScrollView>
      <SummaryHeader vaultId={vault.vaultId} />
      <SummaryTransactionDetails
        minColRatio={vault.loanScheme.minColRatio}
        newMinColRatio={loanScheme.minColRatio}
        vaultInterest={vault.loanScheme.interestRate}
        newVaultInterest={loanScheme.interestRate}
        fee={fee}
      />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob || vault.loanScheme.id === loanScheme.id}
        label={translate('screens/ConfirmEditLoanSchemeScreen', 'CONFIRM EDIT')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmEditLoanSchemeScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='edit_loan_scheme'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: { vaultId: string }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-b border-gray-300')}
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      style={tailwind('flex-col px-4 py-6')}
    >
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('mb-1 text-sm')}
        testID='edit_loan_scheme_title'
      >
        {translate('screens/ConfirmEditLoanSchemeScreen', 'You are editing scheme of vault')}
      </ThemedText>
      <ThemedText
        testID='edit_loan_scheme_vault_id'
        style={tailwind('text-sm font-medium mb-1')}
      >
        {props.vaultId}
      </ThemedText>
    </ThemedView>
  )
}

interface SummaryTransactionDetailsProps {
  minColRatio: string
  vaultInterest: string
  newMinColRatio: string
  newVaultInterest: string
  fee: BigNumber
}

function SummaryTransactionDetails (props: SummaryTransactionDetailsProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmEditLoanSchemeScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmEditLoanSchemeScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmEditLoanSchemeScreen', 'Edit loan scheme'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <WalletAddressRow />
      <NumberRow
        lhs={translate('screens/ConfirmEditLoanSchemeScreen', 'Prev. minimum collateralization ratio')}
        rhs={{
          value: new BigNumber(props.minColRatio).toFixed(2),
          testID: 'prev_min_col_ratio',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmEditLoanSchemeScreen', 'Prev. vault interest (APR)')}
        rhs={{
          value: new BigNumber(props.vaultInterest).toFixed(2),
          testID: 'prev_vault_interest',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmEditLoanSchemeScreen', 'New minimum collateralization ratio')}
        rhs={{
          value: new BigNumber(props.newMinColRatio).toFixed(2),
          testID: 'new_min_col_ratio',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmEditLoanSchemeScreen', 'New vault interest (APR)')}
        rhs={{
          value: new BigNumber(props.newVaultInterest).toFixed(2),
          testID: 'new_vault_interest',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
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

interface EditForm {
  vaultId: string
  loanScheme: LoanScheme
}

async function editLoanScheme ({
  vaultId,
  loanScheme
}: EditForm, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      const signed = await builder.loans.updateVault({
        vaultId: vaultId,
        ownerAddress: script,
        schemeId: loanScheme.id
      }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmEditLoanSchemeScreen', 'Editing loan scheme'),
      description: translate('screens/ConfirmEditLoanSchemeScreen', 'Updating vault to min. collateralization ratio of {{mincolRatio}}% and interest rate of {{ir}}%', {
        mincolRatio: loanScheme.minColRatio,
        ir: loanScheme.interestRate
      }),
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
