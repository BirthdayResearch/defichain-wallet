import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '@api'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { TextRow } from '@components/TextRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { useNetworkContext } from '@contexts/NetworkContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionTag } from '@components/ConversionTag'
import { ConversionDetailsRow } from '@components/ConversionDetailsRow'
import { TransactionResultsRow } from '@components/TransactionResultsRow'
import { EstimatedFeeInfo } from '@components/EstimatedFeeInfo'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { ConversionBreakdown } from '@components/ConversionBreakdown'

type Props = StackScreenProps<BalanceParamList, 'SendConfirmationScreen'>

export function SendConfirmationScreen ({ route }: Props): JSX.Element {
  const network = useNetworkContext()
  const {
    token,
    destination,
    amount,
    fee,
    DFIUtxo,
    DFIToken,
    isConversionRequired,
    conversionAmount
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const expectedBalance = BigNumber.maximum(new BigNumber(token.amount).minus(amount.toFixed(8)), 0).toFixed(8)
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
      onTransactionBroadcast(isOnPage, navigation)
    })
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

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8 mb-4')}
      >
        <SummaryTitle
          amount={amount}
          suffix={token.displaySymbol}
          suffixType='text'
          testID='text_send_amount'
          title={translate('screens/SendConfirmationScreen', 'You are sending')}
        />
        {isConversionRequired === true && <ConversionTag />}
      </ThemedView>

      {isConversionRequired === true &&
        <ConversionBreakdown
          dfiUtxo={DFIUtxo}
          dfiToken={DFIToken}
          amount={conversionAmount}
          mode='accountToUtxos'
        />}
      <ThemedSectionTitle
        testID='title_transaction_detail'
        text={translate('screens/SendConfirmationScreen', 'TRANSACTION DETAILS')}
      />

      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Transaction type')}
        rhs={{
          value: isConversionRequired === true ? translate('screens/SendConfirmationScreen', 'Convert & send') : translate('screens/SendConfirmationScreen', 'Send'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Address')}
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

      <EstimatedFeeInfo
        lhs={translate('screens/SendConfirmationScreen', 'Estimated fee')}
        rhs={{
          value: fee.toFixed(8),
          testID: 'text_fee',
          suffix: token.displaySymbol
        }}
      />

      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Estimated cost')}
        rhs={{
          value: amount.plus(fee).toFixed(8),
          testID: 'text_cost',
          suffixType: 'text',
          suffix: token.displaySymbol
        }}
      />

      {isConversionRequired === true &&
        <ConversionDetailsRow
          utxoBalance='0'
          tokenBalance={expectedBalance}
        />}

      <TransactionResultsRow
        tokens={[
          {
            symbol: token.displaySymbol,
            value: expectedBalance,
            suffix: token.displaySymbol
          }
        ]}
      />

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendConfirmationScreen', 'CONFIRM TRANSACTION')}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={isSubmitting ? translate('screens/SendConfirmationScreen', 'SENDING') : translate('screens/SendConfirmationScreen', 'CONVERTING')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='send'
      />
    </ThemedScrollView>
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
}: SendForm, dispatch: Dispatch<any>, onBroadcast: () => void): Promise<void> {
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
    Logging.error(e)
  }
}
