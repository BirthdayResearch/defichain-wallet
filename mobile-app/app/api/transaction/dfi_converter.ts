import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { DfTxSigner } from '@store/transaction_queue'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'

export async function dfiConversionSigner (account: WhaleWalletAccount, amount: BigNumber, mode: ConversionMode): Promise<CTransactionSegWit> {
  const script = await account.getScript()
  const builder = account.withTransactionBuilder()
  let signed: TransactionSegWit
  if (mode === 'utxosToAccount') {
    signed = await builder.account.utxosToAccount({
      to: [{
        script,
        balances: [
          {
            token: 0,
            amount
          }
        ]
      }]
    }, script)
  } else {
    signed = await builder.account.accountToUtxos({
      from: script,
      balances: [
        {
          token: 0,
          amount
        }
      ],
      mintingOutputsStart: 2 // 0: DfTx, 1: change, 2: minted utxos (mandated by jellyfish-tx)
    }, script)
  }
  return new CTransactionSegWit(signed)
}

export function dfiConversionCrafter (amount: BigNumber, mode: ConversionMode, onBroadcast: () => any, submitButtonLabel?: string): DfTxSigner {
  return {
    sign: async (account: WhaleWalletAccount) => await dfiConversionSigner(account, amount, mode),
    title: translate('screens/ConvertConfirmScreen', 'Converting DFI'),
    description: translate('screens/ConvertConfirmScreen', 'Converting {{amount}} {{symbolA}} to {{symbolB}}', {
      amount: amount.toFixed(8),
      ...(mode === 'utxosToAccount'
        ? {
          symbolA: 'UTXO',
          symbolB: 'Token'
        }
        : {
          symbolA: 'Token',
          symbolB: 'UTXO'
        })
    }),
    onBroadcast,
    submitButtonLabel: submitButtonLabel !== undefined ? translate('screens/ConvertConfirmScreen', submitButtonLabel) : undefined
  }
}
