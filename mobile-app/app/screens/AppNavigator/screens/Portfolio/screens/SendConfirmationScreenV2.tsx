import { Dispatch, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import Checkbox from 'expo-checkbox'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind, getColor } from '@tailwind'
import { translate } from '@translations'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { RootState } from '@store'
import { WalletToken } from '@store/wallet'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { useAddressLabel } from '@hooks/useAddressLabel'
import { View } from '@components'
import { ThemedActivityIndicatorV2, ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedView, ThemedViewV2 } from '@components/themed'
import { SummaryTitleV2 } from '@components/SummaryTitleV2'
import { NumberRowV2 } from '@components/NumberRowV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { PortfolioParamList } from '../PortfolioNavigator'
import { WalletAlert } from '@components/WalletAlert'

type Props = StackScreenProps<PortfolioParamList, 'SendConfirmationScreenV2'>

export function SendConfirmationScreenV2 ({ route }: Props): JSX.Element {
  const { address } = useWalletContext()
  const addressLabel = useAddressLabel(address)
  const network = useNetworkContext()
  const {
    token,
    destination,
    amount,
    amountInUsd,
    fee,
    conversion,
    toAddressLabel,
    addressType
  } = route.params
  const logger = useLogger()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const [isAcknowledge, setIsAcknowledge] = useState(false)
  const [tokenADisplaySymbol, tokenBDisplaySymbol] = token.displaySymbol.split('-')

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
      WalletAlert({
        title: translate('screens/Settings', 'Cancel transaction'),
        message: translate('screens/Settings', 'By cancelling, you will lose any changes you made for your transaction.'),
        buttons: [
          {
            text: translate('screens/Settings', 'Go back'),
            style: 'cancel'
          },
          {
            text: translate('screens/Settings', 'Cancel'),
            style: 'destructive',
            onPress: async () => {
              navigation.navigate('PortfolioScreen')
            }
          }
        ]
      })
    }
  }

  return (
    <ThemedScrollViewV2 style={tailwind('pb-4')}>
      <ThemedViewV2 style={tailwind('flex-col px-5 py-8')}>
        <SummaryTitleV2
          amount={amount}
          title={translate('screens/SendConfirmationScreen', 'You are sending')}
          testID='text_send_amount'
          iconA={tokenADisplaySymbol}
          iconB={tokenBDisplaySymbol}
          fromAddress={address}
          fromAddressLabel={addressLabel}
          toAddress={destination}
          toAddressLabel={toAddressLabel}
          addressType={addressType}
        />

        {conversion?.isConversionRequired === true &&
          <ThemedView
            style={tailwind('border-t-0.5 pt-5 mt-8 mb-2')}
            light={tailwind('bg-transparent border-mono-light-v2-300')}
            dark={tailwind('bg-transparent border-mono-dark-v2-300')}
          >
            <NumberRowV2
              containerStyle={{
                style: tailwind('flex-row items-start w-full bg-transparent')
              }}
              lhs={{
                value: translate('screens/SendConfirmationScreen', 'Amount to convert'),
                testID: 'amount_to_convert',
                themedProps: {
                  light: tailwind('text-mono-light-v2-500'),
                  dark: tailwind('text-mono-dark-v2-500')
                }
              }}
              rhs={{
                value: conversion.conversionAmount.toFixed(8),
                suffix: ' DFI',
                testID: 'amount_to_convert_value',
                themedProps: {
                  light: tailwind('text-mono-light-v2-900'),
                  dark: tailwind('text-mono-dark-v2-900')
                }
              }}
            />
            <View style={tailwind('flex flex-row text-right items-center justify-end')}>
              <ThemedTextV2
                style={tailwind('mr-1.5 text-sm font-normal-v2')}
                light={tailwind('text-mono-light-v2-500')}
                dark={tailwind('text-mono-dark-v2-500')}
                testID='conversion_status'
              >
                {
                  translate('screens/ConvertConfirmScreen',
                    conversion?.isConversionRequired && conversion?.isConverted !== true
                      ? 'Converting'
                      : 'Converted')
                }
              </ThemedTextV2>
              {conversion?.isConverted !== true && <ThemedActivityIndicatorV2 />}
              {
                conversion?.isConverted === true &&
                  <ThemedIcon
                    light={tailwind('text-success-500')}
                    dark={tailwind('text-darksuccess-500')}
                    iconType='MaterialIcons'
                    name='check-circle'
                    size={20}
                  />
              }
            </View>
          </ThemedView>}

        <NumberRowV2
          containerStyle={{
            style: tailwind('flex-row items-start w-full bg-transparent border-t-0.5 pt-5', { 'mt-8': conversion?.isConversionRequired !== true }),
            light: tailwind('bg-transparent border-mono-light-v2-300'),
            dark: tailwind('bg-transparent border-mono-dark-v2-300')
          }}
          lhs={{
            value: translate('screens/SendConfirmationScreen', 'Transaction fee'),
            testID: 'transaction_fee',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: fee.toFixed(8),
            suffix: ' DFI',
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
            testID: 'text_amount',
            themedProps: {
              light: tailwind('text-mono-light-v2-500'),
              dark: tailwind('text-mono-dark-v2-500')
            }
          }}
          rhs={{
            value: amount.toFixed(8),
            testID: 'text_amount',
            suffix: ` ${token.displaySymbol}`,
            usdAmount: amountInUsd,
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
      <View style={tailwind('mx-7')}>
        <SubmitButtonGroupV2
          isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob || (token.isLPS && !isAcknowledge)}
          isCancelDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          label={translate('screens/SendConfirmationScreen', 'Send')}
          onCancel={onCancel}
          onSubmit={onSubmit}
          displayCancelBtn
          title='send'
          buttonStyle='mx-5 mb-2'
        />
      </View>
    </ThemedScrollViewV2>
  )
}

function LpAcknowledgeSwitch (props: { isAcknowledge: boolean, onSwitch: (val: boolean) => void }): JSX.Element {
  return (
    <View style={tailwind('px-10 py-8 pt-4 flex flex-row justify-center')}>
      <Checkbox
        value={props.isAcknowledge}
        style={tailwind('h-6 w-6 mt-1 rounded')}
        onValueChange={props.onSwitch}
        color={props.isAcknowledge ? getColor('brand-v2-500') : undefined}
        testID='lp_ack_switch'
      />
      <TouchableOpacity
        style={tailwind('flex-1')}
        activeOpacity={0.7}
        onPress={() => {
          props.onSwitch(!props.isAcknowledge)
        }}
      >
        <ThemedTextV2
          style={tailwind('ml-4 flex-1 text-xs font-normal-v2')}
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
        >
          {translate('screens/SendConfirmationScreen', 'I acknowledge that sending LP tokens to addresses that are not DeFiChain compatible wallets may result in irreversible loss of funds.')}
        </ThemedTextV2>
      </TouchableOpacity>
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
      title: translate('screens/SendConfirmationScreen', 'Sending {{amount}} {{displaySymbol}} to {{toAddress}}', {
        amount: amount.toFixed(8),
        displaySymbol: token.displaySymbol,
        toAddress: address
      }),
      drawerMessages: {
        preparing: translate('screens/OceanInterface', 'Preparing to send…'),
        waiting: translate('screens/OceanInterface', 'Sending {{amount}} {{displaySymbol}}', {
          amount: amount.toFixed(8),
          displaySymbol: token.displaySymbol
        }),
        complete: translate('screens/OceanInterface', '{{amount}} {{displaySymbol}} sent', {
          amount: amount.toFixed(8),
          displaySymbol: token.displaySymbol
        })
      },
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
