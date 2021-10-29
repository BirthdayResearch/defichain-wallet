import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import React from 'react'
import { useSelector } from 'react-redux'
import { LoanParamList, LoanScheme } from '../LoansNavigator'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { TextRow } from '@components/TextRow'
import BigNumber from 'bignumber.js'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'

type Props = StackScreenProps<LoanParamList, 'ConfirmCreateVaultScreen'>

export function ConfirmCreateVaultScreen ({ route, navigation }: Props): JSX.Element {
  const { loanScheme, fee } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

  function onCancel (): void {
    navigation.navigate({
      name: 'CreateVaultScreen',
      params: {
        loanScheme
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    // TODO: create signer to create vault, remove custom navigation below
    navigation.navigate({
      name: 'LoansScreen',
      params: {
        displayEmptyVault: false
      },
      merge: true
    })
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM CREATE VAULT'
    }
    return 'CREATING'
  }

  return (
    <ThemedScrollView testID='confirm_create_vault_screen'>
      <SummaryHeader />
      <SummaryTransactionDetails fee={fee} />
      <SummaryVaultDetails loanScheme={loanScheme} />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmCreateVaultScreen', 'CONFIRM CREATE VAULT')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmCreateVaultScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='create_vault'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-300')}
      style={tailwind('flex-col px-4 py-6')}
    >
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('mb-2')}
      >
        {translate('screens/ConfirmCreateVaultScreen', 'You are creating vault')}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedView
          light={tailwind('bg-gray-100')}
          dark={tailwind('bg-gray-700')}
          style={tailwind('w-8 h-8 rounded-full flex items-center justify-center mr-2')}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            name='shield'
            size={14}
            light={tailwind('text-gray-600')}
            dark={tailwind('text-gray-300')}
          />
        </ThemedView>
        <ThemedText
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-sm')}
        >
          {translate('screens/ConfirmCreateVaultScreen', 'ID is generated once vault is created')}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function SummaryTransactionDetails (props: {fee: BigNumber}): JSX.Element {
  const vaultFee = new BigNumber(2)
  const transactionCost = vaultFee.plus(props.fee)
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmCreateVaultScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmCreateVaultScreen', 'Create vault'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <FeeInfoRow
        type='VAULT_FEE'
        value={vaultFee.toFixed(8)}
        testID='vault_fee'
        suffix='DFI'
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='estimated_fee'
        suffix='DFI'
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Total transaction cost')}
        rhs={{
          value: transactionCost.toFixed(8),
          testID: 'total_transaction_cost',
          suffixType: 'text',
          suffix: 'DFI'
        }}
      />
    </>
  )
}

function SummaryVaultDetails (props: {loanScheme: LoanScheme}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmCreateVaultScreen', 'VAULT DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Min. collateral ratio')}
        rhs={{
          value: new BigNumber(props.loanScheme.minColRatio).toFixed(2),
          testID: 'confirm_min_col_ratio_value',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Interest rate (APR)')}
        rhs={{
          value: new BigNumber(props.loanScheme.interestRate).toFixed(2),
          testID: 'confirm_interest_rate_value',
          suffixType: 'text',
          suffix: `% ${translate('screens/ConfirmCreateVaultScreen', 'APR')}`
        }}
      />
    </>
  )
}
