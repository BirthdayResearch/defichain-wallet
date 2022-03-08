import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionTag } from '@components/ConversionTag'
import { TransactionResultsRow } from '@components/TransactionResultsRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { InfoText } from '@components/InfoText'
import { Switch, View } from '@components'
import { WalletAddressRow } from '@components/WalletAddressRow'

type Props = StackScreenProps<BalanceParamList, 'SendConfirmationScreen'>

export function SendConfirmationScreen ({ route }: Props): JSX.Element {
  const network = useNetworkContext()
  const {
    token,
    destination,
    amount,
    fee,
    conversion
  } = route.params
  const logger = useLogger()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const expectedBalance = BigNumber.maximum(new BigNumber(token.amount).minus(amount.toFixed(8)), 0).toFixed(8)
  const [isAcknowledge, setIsAcknowledge] = useState(false)

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await send({
      address: destination,
      token,
      amount,
      networkName: network.networkName
    }, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, logger)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'Send',
        params: {
          token
        },
        merge: true
      })
    }
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM SEND'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'SENDING'
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8')}
      >
        <SummaryTitle
          amount={amount}
          suffix={token.displaySymbol}
          suffixType='text'
          testID='text_send_amount'
          title={translate('screens/SendConfirmationScreen', 'You are sending')}
        />
        {conversion?.isConversionRequired === true && <ConversionTag />}
      </ThemedView>

      <ThemedSectionTitle
        testID='title_transaction_detail'
        text={translate('screens/SendConfirmationScreen', 'TRANSACTION DETAILS')}
      />

      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Transaction type')}
        rhs={{
          value: conversion?.isConversionRequired === true ? translate('screens/SendConfirmationScreen', 'Convert & send') : translate('screens/SendConfirmationScreen', 'Send'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <WalletAddressRow />
      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Recipient address')}
        rhs={{
          value: destination,
          testID: 'text_destination'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />

      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Amount to send')}
        rhs={{
          value: amount.toFixed(8),
          testID: 'text_amount',
          suffixType: 'text',
          suffix: token.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix={token.displaySymbol}
      />

      <TransactionResultsRow
        tokens={[
          {
            symbol: token.displaySymbol,
            value: expectedBalance,
            suffix: token.displaySymbol
          }
        ]}
      />

      {conversion?.isConversionRequired === true && (
        <View style={tailwind('p-4 mt-2')}>
          <InfoText
            testID='conversion_warning_info_text'
            text={translate('components/ConversionInfoText', 'Please wait as we convert tokens for your transaction. Conversions are irreversible.')}
          />
        </View>
      )}

      {token.isLPS &&
        (
          <LpAcknowledgeSwitch isAcknowledge={isAcknowledge} onSwitch={(val) => setIsAcknowledge(val)} />
        )}

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob || (token.isLPS && !isAcknowledge)}
        isCancelDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendConfirmationScreen', 'CONFIRM SEND')}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/SendConfirmationScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='send'
      />
    </ThemedScrollView>
  )
}

function LpAcknowledgeSwitch (props: {isAcknowledge: boolean, onSwitch: (val: boolean) => void}): JSX.Element {
  return (
    <View style={tailwind('mx-4 mt-8 flex flex-row items-center')}>
      <Switch
        value={props.isAcknowledge}
        onValueChange={props.onSwitch}
        testID='lp_ack_switch'
      />
      <ThemedText
        light={tailwind('text-gray-700')}
        dark={tailwind('text-gray-300')}
        style={tailwind('ml-2 flex-1 text-xs')}
      >
        {translate('screens/SendConfirmationScreen', 'Send Liquidity Pool tokens only to DeFiChain Wallet addresses. Sending to an exchange or a central entity will result in irreversible loss of funds.')}
      </ThemedText>
    </View>
  )
}
interface SendForm {
  amount: BigNumber
  address: string
  token: WalletToken
  networkName: NetworkName
}

async function send ({
  address,
  token,
  amount,
  networkName
}: SendForm, dispatch: Dispatch<any>, onBroadcast: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const to = DeFiAddress.from(networkName, address).getScript()

    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()

      let signed: TransactionSegWit
      if (token.symbol === 'DFI') {
        /* if (amount.gte(token.amount)) signed = await builder.utxo.sendAll(to)
        else */
        signed = await builder.utxo.send(amount, to, script)
      } else {
        signed = await builder.account.accountToAccount({
          from: script,
          to: [{
            script: to,
            balances: [{
              token: +token.id,
              amount
            }]
          }]
        }, script)
      }
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/SendConfirmationScreen', 'Sending', { symbol: token.displaySymbol }),
      description: translate('screens/SendConfirmationScreen', 'Sending {{amount}} {{symbol}}', {
        amount: amount.toFixed(8),
        symbol: token.displaySymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
