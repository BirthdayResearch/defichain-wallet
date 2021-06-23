import { DeFiAddress } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { P2WPKHTransactionBuilder } from "@defichain/jellyfish-transaction-builder";
import { WalletHdNode } from "@defichain/jellyfish-wallet";
import { WhaleFeeRateProvider, WhalePrevoutProvider } from "@defichain/whale-api-wallet";
import BigNumber from "bignumber.js";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { SmartBuffer } from 'smart-buffer'
import tailwind from "tailwind-rn";
import { Text, TextInput, View } from "../../../../components";
import { PrimaryColorStyle } from "../../../../constants/Theme";
import { useWhaleApiClient } from "../../../../hooks/api/useWhaleApiClient";
import { useWalletAPI } from "../../../../hooks/wallet/WalletAPI";
import { RootState } from "../../../../store";

export function SendScreen (): JSX.Element {
  const network = useSelector<RootState, NetworkName>(state => state.network.whale?.network!)
  const WalletAPI = useWalletAPI()
  const WhaleAPI = useWhaleApiClient()

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');

  async function send () {
    const account = WalletAPI.getWallet().get(0)
    const feeRate = new WhaleFeeRateProvider(WhaleAPI)
    const prevout = new WhalePrevoutProvider(account, 50)

    const builder = new P2WPKHTransactionBuilder(feeRate, prevout, {
      // @ts-ignore need to fix in jellyfish
      get: (_) => account.hdNode as WalletHdNode
    })

    const signed = await builder.utxo.send(
      new BigNumber(amount),
      DeFiAddress.from(network, address).getScript(),
      await account.getScript()
    )

    const buffer = new SmartBuffer()
    new CTransactionSegWit(signed).toBuffer(buffer)
    const hex = buffer.toString('hex')

    await WhaleAPI.transactions.send({
      hex: hex
    })
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <View>
        <Text style={tailwind('p-4')}>Address:</Text>
        <TextInput
          style={tailwind('p-4 bg-white')}
          autoCapitalize='none'
          onChangeText={setAddress}
          placeholder='Address'
        />
        <TextInput
          style={tailwind('p-4 mt-4 bg-white')}
          autoCapitalize='none'
          onChangeText={setAmount}
          placeholder='Amount'
        />
        <TouchableOpacity
          style={[tailwind('m-4 p-3 rounded flex-row justify-center'), PrimaryColorStyle.bg]}
          onPress={send}>
          <Text style={tailwind('text-white font-bold')}>SEND</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
