import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { Dispatch, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ThemedActivityIndicatorV2, ThemedIcon, ThemedScrollViewV2, ThemedText, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { PortfolioParamList } from '../PortfolioNavigator'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { Switch, View } from '@components'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { SummaryTitleV2 } from '@components/SummaryTitleV2'
import { NumberRowV2 } from '@components/NumberRowV2'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useAddressLabel } from '@hooks/useAddressLabel'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'

type Props = StackScreenProps<PortfolioParamList, 'SendConfirmationScreen'>

export function SendConfirmationScreenV2 ({ route }: Props): JSX.Element {
  const { address } = useWalletContext()
  const addressLabel = useAddressLabel(address)
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
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  // const expectedBalance = BigNumber.maximum(new BigNumber(token.amount).minus(amount.toFixed(8)).minus(fee), 0).toFixed(8)
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
    <ThemedScrollViewV2 style={tailwind('pb-4')}>
      <ThemedViewV2 style={tailwind('flex-col px-5 py-8')}>
        <SummaryTitleV2
          amount={amount}
          title={translate('screens/SendConfirmationScreen', 'You are sending')}
          testID='text_send_amount'
          iconA={token.displaySymbol}
          fromAddress={address}
          fromAddressLabel={addressLabel}
          toAddress={destination}
        />

        {conversion?.isConversionRequired === true &&
          <>
            <NumberRowV2
              containerStyle={{
                style: tailwind('flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-8'),
                light: tailwind('bg-transparent border-mono-light-v2-300'),
                dark: tailwind('bg-transparent border-mono-dark-v2-300')
              }}
              lhs={{
                value: translate('screens/ConvertConfirmScreen', 'Amount to convert'),
                testID: 'amount_to_convert_label',
                themedProps: {
                  light: tailwind('text-mono-light-v2-500'),
                  dark: tailwind('text-mono-dark-v2-500')
                }
              }}
              rhs={{
                value: conversion.conversionAmount.toFixed(8),
                suffix: 'DFI',
                testID: 'amount_to_convert_value',
                themedProps: {
                  light: tailwind('text-mono-light-v2-900'),
                  dark: tailwind('text-mono-dark-v2-900')
                }
              }}
            />
            <View style={tailwind('flex flex-row text-right items-center justify-end')}>
              <ThemedTextV2
                style={tailwind('mr-1.5')}
                light={tailwind('text-mono-light-v2-500')}
                dark={tailwind('text-mono-dark-v2-500')}
              >
                {conversion?.isConversionRequired && conversion?.isConverted !== true ? 'Converting' : 'Converted'}
              </ThemedTextV2>
              {conversion?.isConversionRequired && conversion?.isConverted !== true && <ThemedActivityIndicatorV2 />}
              {
                conversion?.isConversionRequired && conversion?.isConverted === true &&
                  <ThemedIcon
                    light={tailwind('text-success-600')}
                    dark={tailwind('text-darksuccess-500')}
                    iconType='MaterialIcons'
                    name='check-circle'
                    size={20}
                  />
              }
            </View>
          </>}

        <NumberRowV2
          containerStyle={{
            style: tailwind('flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-8'),
            light: tailwind('bg-transparent border-mono-light-v2-300'),
            dark: tailwind('bg-transparent border-mono-dark-v2-300')
          }}
          lhs={{
            value: translate('screens/ConvertConfirmScreen', 'Transaction fee'),
            testID: 'transaction_fee_label',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: fee.toFixed(8),
            suffix: 'DFI',
            testID: 'transaction_fee_value',
            themedProps: {
              light: tailwind('text-mono-light-v2-900'),
              dark: tailwind('text-mono-dark-v2-900')
            }
          }}
        />
        <NumberRowV2
          containerStyle={{
            style: tailwind('flex-row items-start w-full bg-transparent mt-5 border-b-0.5 pb-5'),
            light: tailwind('bg-transparent border-mono-light-v2-300'),
            dark: tailwind('bg-transparent border-mono-dark-v2-300')
          }}
          lhs={{
            value: translate('screens/SendConfirmationScreen', 'Amount to send'),
            testID: 'test_idhere',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: amount.toFixed(8),
            testID: 'text_amount',
            suffix: token.displaySymbol,
            usdAmount: new BigNumber(12345678.12345678),
            themedProps: {
              style: tailwind('font-semibold-v2 text-sm'),
              light: tailwind('text-mono-light-v2-900'),
              dark: tailwind('text-mono-dark-v2-900')
            }
          }}
        />
      </ThemedViewV2>
      {token.isLPS &&
        (
          <LpAcknowledgeSwitch isAcknowledge={isAcknowledge} onSwitch={(val) => setIsAcknowledge(val)} />
        )}
      <SubmitButtonGroupV2
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob || (token.isLPS && !isAcknowledge)}
        isCancelDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendConfirmationScreen', 'SEND')}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/SendConfirmationScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='send'
        buttonStyle='mx-5'
      />
    </ThemedScrollViewV2>
  )
}

function LpAcknowledgeSwitch (props: { isAcknowledge: boolean, onSwitch: (val: boolean) => void }): JSX.Element {
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
