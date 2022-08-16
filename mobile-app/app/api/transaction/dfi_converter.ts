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
  const [symbolA, symbolB] = mode === 'utxosToAccount' ? ['UTXO', 'tokens'] : ['tokens', 'UTXO']
  return {
    sign: async (account: WhaleWalletAccount) => await dfiConversionSigner(account, amount, mode),
    title: translate('screens/ConvertConfirmScreen', 'Convert {{amount}} DFI to {{target}}', {
      amount: amount.toFixed(8),
      target: mode === 'utxosToAccount' ? 'tokens' : 'UTXO'
    }),
    drawerMessages: {
      preparing: translate('screens/OceanInterface', 'Preparing to convert…'),
      waiting: translate('screens/OceanInterface', 'Converting {{amount}} DFI {{symbolA}} to {{symbolB}}', {
        symbolA: symbolA,
        symbolB: symbolB,
        amount: amount.toFixed(8)
      }),
      complete: translate('screens/OceanInterface', '{{amount}} DFI converted to {{symbolB}}', {
        symbolB: symbolB,
        amount: amount.toFixed(8)
      })
    },
    onBroadcast,
    submitButtonLabel: submitButtonLabel !== undefined ? translate('screens/ConvertConfirmScreen', submitButtonLabel) : undefined
  }
}
