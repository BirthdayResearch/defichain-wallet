import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LoanParamList } from '../LoansNavigator'
import { LoanScheme } from '@defichain/whale-api-client/dist/api/loan'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { TextRow } from '@components/TextRow'
import BigNumber from 'bignumber.js'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { ConversionTag } from '@components/ConversionTag'
import { ConversionParam } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { fetchVaults } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { EnvironmentNetwork } from '@environment'
import { WalletAddressRow } from '@components/WalletAddressRow'

type Props = StackScreenProps<LoanParamList, 'ConfirmCreateVaultScreen'>

export function ConfirmCreateVaultScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const {
    loanScheme,
    fee,
    conversion
  } = route.params
  const logger = useLogger()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const dispatch = useDispatch()

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

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
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    await createVault({
      address,
      loanScheme
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
      return 'CONFIRM CREATE VAULT'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'CREATING'
  }

  return (
    <ThemedScrollView testID='confirm_create_vault_screen'>
      <SummaryHeader conversion={conversion} />
      <SummaryTransactionDetails fee={fee} conversion={conversion} />
      <SummaryVaultDetails loanScheme={loanScheme} />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmCreateVaultScreen', 'CONFIRM CREATE VAULT')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmCreateVaultScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='create_vault'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: { conversion?: ConversionParam }): JSX.Element {
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
          {translate('screens/ConfirmCreateVaultScreen', 'ID will generate once vault has been created')}
        </ThemedText>
      </View>
      {props.conversion?.isConversionRequired === true && <ConversionTag />}
    </ThemedView>
  )
}

function SummaryTransactionDetails (props: { fee: BigNumber, conversion?: ConversionParam }): JSX.Element {
  const { network } = useNetworkContext()
  const vaultFee = new BigNumber(network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 2 : 1)
  const transactionCost = vaultFee.plus(props.fee)
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmCreateVaultScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Transaction type')}
        rhs={{
          value: props.conversion?.isConversionRequired === true ? translate('screens/ConfirmCreateVaultScreen', 'Convert & create vault') : translate('screens/ConfirmCreateVaultScreen', 'Create vault'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <WalletAddressRow />
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

function SummaryVaultDetails (props: { loanScheme: LoanScheme }): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmCreateVaultScreen', 'VAULT DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Min. collateralization ratio')}
        rhs={{
          value: new BigNumber(props.loanScheme.minColRatio).toFixed(2),
          testID: 'confirm_min_col_ratio_value',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
        info={{
          title: 'Min. collateralization ratio',
          message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Interest rate (APR)')}
        rhs={{
          value: new BigNumber(props.loanScheme.interestRate).toFixed(2),
          testID: 'confirm_interest_rate_value',
          suffixType: 'text',
          suffix: `% ${translate('screens/ConfirmCreateVaultScreen', 'APR')}`,
          style: tailwind('ml-0')
        }}
      />
    </>
  )
}

interface VaultForm {
  loanScheme: LoanScheme
  address: string
}

async function createVault ({
  address,
  loanScheme
}: VaultForm, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      const signed = await builder.loans.createVault({
        ownerAddress: script,
        schemeId: loanScheme.id
      }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmCreateVaultScreen', 'Creating vault'),
      description: translate('screens/ConfirmCreateVaultScreen', 'Creating vault with min. collateralization ratio of {{amount}}% and interest rate of {{ir}}% APR', {
        amount: loanScheme.minColRatio,
        ir: loanScheme.interestRate
      }),
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
