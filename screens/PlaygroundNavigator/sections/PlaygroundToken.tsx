import { TokenInfo } from '@defichain/jellyfish-api-core/dist/category/token'
import { PlaygroundRpcClient } from '@defichain/playground-api-client'
import React, { useEffect, useState } from 'react'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../components'
import { usePlaygroundRpcClient } from '../../../hooks/api/usePlaygroundClient'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'
import { WalletStatus } from '../../../store/wallet'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'
import BigNumber from 'bignumber.js'
import { UTXO } from '@defichain/jellyfish-api-core/dist/category/wallet'
import { SmartBuffer } from 'smart-buffer'
import { RegTest } from '@defichain/jellyfish-network'
import { TransactionSigner } from '@defichain/jellyfish-transaction-signature'
import { OP_CODES, Vout, Script, DeFiTransactionConstants, Transaction, CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { toOPCodes } from '@defichain/jellyfish-transaction/dist/script/_buffer'
import { Bech32, Bs58, WIF } from '@defichain/jellyfish-crypto'

const PLAYGROUND_MN = {
  address: 'mwsZw8nF7pKxWH8eoKL9tPxTpaFkz7QeLU',
  privKey: 'cRiRQ9cHmy5evDqNDdEV8f6zfbK6epi9Fpz4CRZsmLEmkwy54dWz',
  pubKeyHash: Bs58.toHash160('mwsZw8nF7pKxWH8eoKL9tPxTpaFkz7QeLU').buffer
}

export function PlaygroundToken (): JSX.Element | null {
  const WalletAPI = useWalletAPI()
  const rpcClient = usePlaygroundRpcClient()
  const [status, setStatus] = useState<string>('loading')
  const [tokens, setTokens] = useState<PlaygroundTokenInfo[]>([])

  useEffect(() => {
    getTokens(rpcClient).then(value => {
      setTokens(value)
      setStatus('online')
    }).catch(() => {
      setStatus('error')
    })
  }, [])

  if (WalletAPI.getStatus() !== WalletStatus.LOADED_WALLET) {
    return null
  }

  const actions = tokens.filter(({ symbol }) => symbol !== 'DFI').map(token => {
    return (
      <PlaygroundAction
        key={token.id}
        testID={`playground_token_${token.symbol}`}
        title={`Top up 10.0 ${token.symbol} to Wallet`}
        onPress={async () => {
          const address = await WalletAPI.getWallet().get(0).getAddress()
          await rpcClient.call('sendtokenstoaddress', [{}, {
            [address]: `10@${token.symbol}`
          }], 'number')
        }}
      />
    )
  })

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-2xl font-bold')}>Token</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatus
            online={status === 'online'}
            loading={status === 'loading'}
            error={status === 'error'}
          />
        </View>
      </View>
      <PlaygroundAction
        key='0'
        testID='playground_token_DFI'
        title='Top up 10.0 DFI to Wallet'
        onPress={async () => {
          const recipient = await WalletAPI.getWallet().get(0).getScript()
          await playgroundUtxoToUserAccount(rpcClient, recipient)
        }}
      />
      {actions}
    </View>
  )
}

export type PlaygroundTokenInfo = TokenInfo & { id: string }

async function getTokens (rpcClient: PlaygroundRpcClient): Promise<PlaygroundTokenInfo[]> {
  const result = await rpcClient.token.listTokens()

  return Object.entries(result).map(([id, info]) => {
    return { id, ...info }
  }).sort(a => Number.parseInt(a.id))
}

/**
 * this action requires 2 steps, convert utxos into token
 * main user token balance require at least 6-8 seconds to be reflected
 */
async function playgroundUtxoToUserAccount (rpcClient: PlaygroundRpcClient, recipientLockScript: Script, amount: BigNumber = new BigNumber(10)): Promise<string> {
  const pair = WIF.asEllipticPair(PLAYGROUND_MN.privKey)

  // create a P2WPKH address to hold utxo
  const tempMNAddress = Bech32.fromHash160(PLAYGROUND_MN.pubKeyHash, RegTest.bech32.hrp)

  // fund utxo to playground new address
  const txid = await rpcClient.call('sendtoaddress', [tempMNAddress, amount.plus(0.001).toNumber()], 'bignumber')
  await (new Promise(resolve => { setTimeout(resolve, 3100) })) // wait for a block
  const utxos = await rpcClient.call('listunspent', [1, 9999999, [tempMNAddress], false], 'bignumber')
  const utxo: UTXO = (utxos as UTXO[]).find(utxo => utxo.txid === txid) as UTXO
  const utxoLockScript = { stack: toOPCodes(SmartBuffer.fromBuffer(Buffer.from(utxo.scriptPubKey, 'hex'))) }

  // send token to user (wallet account)
  const a2a: Vout = {
    value: amount,
    script: {
      stack: [OP_CODES.OP_RETURN, OP_CODES.OP_DEFI_TX_UTXOS_TO_ACCOUNT({
        to: [{
          script: recipientLockScript,
          balances: [{
            token: 0,
            amount
          }]
        }]
      })]
    },
    tokenId: 0x00
  }

  const transaction: Transaction = {
    version: DeFiTransactionConstants.Version,
    vin: [
      {
        index: utxo.vout,
        script: { stack: [] },
        sequence: 0xffffffff,
        txid: utxo.txid
      }
    ],
    vout: [
      a2a
      // assume no change, 0.001 spared for fee
    ],
    lockTime: 0x00000000
  }

  const signed = await TransactionSigner.sign(transaction, [{
    prevout: {
      value: new BigNumber(10.001),
      script: utxoLockScript,
      tokenId: 0x00
    },
    ellipticPair: pair
  }])

  return await rpcClient.rawtx.sendRawTransaction(new CTransactionSegWit(signed).toHex())
}
