import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { NumberRow } from '../../../../../components/NumberRow'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { SubmitButtonGroup } from '../../../../../components/SubmitButtonGroup'
import { SummaryTitle } from '../../../../../components/SummaryTitle'
import { TextRow } from '../../../../../components/TextRow'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../../store/ocean'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'SendConfirmationScreen'>

export function SendConfirmationScreen ({ route }: Props): JSX.Element {
  const network = useNetworkContext()
  const { destination, amount, fee } = route.params
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
    <ScrollView style={tailwind('bg-gray-100 pb-4')}>
      <SummaryTitle
        title={translate('screens/SendConfirmationScreen', 'YOU ARE SENDING')} testID='text_send_amount'
        amount={amount} suffix={` ${token.symbol}`}
      />
      <SectionTitle
        text={translate('screens/SendConfirmationScreen', 'TRANSACTION DETAILS')}
        testID='title_transaction_detail'
      />
      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Address')}
        rhs={{ value: destination, testID: 'text_destination' }}
      />
      <TextRow
        lhs={translate('screens/SendConfirmationScreen', 'Network')}
        rhs={{ value: network.network, testID: 'text_network' }}
      />
      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Amount')}
        rightHandElements={[{ value: amount.toFixed(8), suffix: ` ${token.symbol}`, testID: 'text_amount' }]}
      />
      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Estimated fee')}
        rightHandElements={[{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }]}
      />
      <NumberRow
        lhs={translate('screens/SendConfirmationScreen', 'Remaining balance')}
        rightHandElements={[{
          value: BigNumber.maximum(new BigNumber(token.amount).minus(amount.toFixed(8)).minus(fee.toFixed(8)), 0).toFixed(8),
          suffix: ` ${token.symbol}`,
          testID: 'text_balance'
        }]}
      />
      <SubmitButtonGroup
        onSubmit={onSubmit} onCancel={onCancel} title='send'
        label={translate('screens/SendConfirmationScreen', 'SEND')}
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
      />
    </ScrollView>
  )
}

interface SendForm {
  amount: BigNumber
  address: string
  token: AddressToken
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
      title: `${translate('screens/SendScreen', 'Sending')} ${token.symbol}`,
      description: `${translate('screens/SendScreen', `Sending ${amount.toFixed(8)} ${token.symbol}`)}`,
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
