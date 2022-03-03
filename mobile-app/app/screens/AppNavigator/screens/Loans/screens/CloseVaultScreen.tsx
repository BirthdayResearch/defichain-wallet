import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { EnvironmentNetwork } from '@environment'
import { StackScreenProps } from '@react-navigation/stack'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Dispatch, useEffect, useState } from 'react'
import { LoanParamList } from '../LoansNavigator'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { InfoText } from '@components/InfoText'
import { View } from '@components'
import { WalletAddressRow } from '@components/WalletAddressRow'

type Props = StackScreenProps<LoanParamList, 'CloseVaultScreen'>

export function CloseVaultScreen ({ route, navigation }: Props): JSX.Element {
  const { vaultId } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const logger = useLogger()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

  function onCancel (): void {
    navigation.navigate({
      name: 'VaultDetailScreen',
      params: {
        vaultId: vaultId
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    await closeVault(vaultId, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, () => {}, logger)
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  return (
    <ThemedScrollView>
      <SummaryHeader vaultId={vaultId} />
      <SummaryDetails />
      <View style={tailwind('my-4 mx-4')}>
        <InfoText
          testID='close_vault_info_text'
          text={translate('screens/CloseVaultScreen', 'Upon closing, this Vault ID will not be usable anymore. Make sure you don’t need anything from this vault before closing.')}
        />
      </View>
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/CloseVaultScreen', 'CONFIRM CLOSE VAULT')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/CloseVaultScreen', 'CLOSING')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='create_vault'
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
      >
        {translate('screens/CloseVaultScreen', 'You are closing Vault ID')}
      </ThemedText>
      <ThemedText
        style={tailwind('text-sm font-medium mb-1')}
      >
        {props.vaultId}
      </ThemedText>
    </ThemedView>
  )
}

function SummaryDetails (): JSX.Element {
  const { network } = useNetworkContext()
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/CloseVaultScreen', 'TRANSACTION DETAILS')}
      />
      <WalletAddressRow />
      <NumberRow
        lhs={translate('screens/CloseVaultScreen', 'Fees to return')}
        rhs={{
          value: network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 1 : 0.5,
          testID: 'fees_to_return_text',
          suffixType: 'text',
          suffix: 'DFI'
        }}
      />
      <NumberRow
        lhs={translate('screens/CloseVaultScreen', 'Fees to burn')}
        rhs={{
          value: network === EnvironmentNetwork.MainNet || network === EnvironmentNetwork.TestNet ? 1 : 0.5,
          testID: 'fees_to_burn_text',
          suffixType: 'text',
          suffix: 'DFI'
        }}
      />
    </>
  )
}

async function closeVault (
  vaultId: string, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      const signed = await builder.loans.closeVault({
        vaultId: vaultId,
        to: script
      }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/CloseVaultScreen', 'Closing vault'),
      description: translate('screens/CloseVaultScreen', 'You are about to close vault {{vaultId}}', {
        vaultId
      }),
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
