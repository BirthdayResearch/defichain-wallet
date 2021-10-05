import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
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
import { ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import { useNetworkContext } from '@contexts/NetworkContext'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { BalanceParamList } from '../BalancesNavigator'
import { EstimatedFeeInfo } from '@components/EstimationInfo'

type Props = StackScreenProps<BalanceParamList, 'SendConfirmationScreen'>

export function SendConfirmationScreen ({ route }: Props): JSX.Element {
  const network = useNetworkContext()
  const {
    destination,
    amount,
    fee
  } = route.params
  const [token, setToken] = useState(route.params.token)
  const tokens = useTokensAPI()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const postAction = (): void => {
    if (isOnPage) {
      navigation.dispatch(StackActions.popToTop())
    }
  }

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
    }, dispatch, postAction)
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

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id)
    if (t !== undefined) {
      setToken({ ...t })
    }
  }, [JSON.stringify(tokens)])

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <SummaryTitle
        amount={amount}
        suffix={token.displaySymbol}
        suffixType='text'
        testID='text_send_amount'
        title={translate('screens/SendConfirmationScreen', 'You are sending')}
      />

      <ThemedSectionTitle
        testID='title_transaction_detail'
        text={translate('screens/SendConfirmationScreen', 'TRANSACTION DETAILS')}
      />

      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Address')}
        rhs={{ value: destination, testID: 'text_destination' }}
        textStyle={tailwind('text-sm font-normal')}
      />

      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Network')}
        rhs={{ value: network.network, testID: 'text_network' }}
        textStyle={tailwind('text-sm font-normal')}
      />

      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Amount')}
        rhs={{
          value: amount.toFixed(8),
          testID: 'text_amount',
          suffixType: 'text',
          suffix: `${token.displaySymbol}`
        }}
      />

      <EstimatedFeeInfo
        lhs={translate('screens/SendConfirmationScreen', 'Estimated fee')}
        rhs={{
          value: fee.toFixed(8),
          testID: 'text_fee',
          suffix: ` ${token.displaySymbol}`
        }}
      />

      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Remaining balance')}
        rhs={{
          value: BigNumber.maximum(new BigNumber(token.amount).minus(amount.toFixed(8)).minus(fee.toFixed(8)), 0).toFixed(8),
          testID: 'text_balance',
          suffixType: 'text',
          suffix: `${token.displaySymbol}`
        }}
      />

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendConfirmationScreen', 'CONFIRM TRANSACTION')}
        isSubmitting={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        submittingLabel={translate('screens/SendConfirmationScreen', 'SENDING')}
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
}: SendForm, dispatch: Dispatch<any>, postAction: () => void): Promise<void> {
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
          to: [{ script: to, balances: [{ token: +token.id, amount }] }]
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
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
