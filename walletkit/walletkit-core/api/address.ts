import { Eth, fromAddress, fromScript } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";
import { Script } from "@defichain/jellyfish-transaction";
import { ethers } from "ethers";

/**
 * Known Address Types from jellyfish-address
 */
export enum AddressType {
  /**
   * Pay to Witness Public Key Hash
   * Native SEGWIT with Bech32
   */
  P2WPKH = "P2WPKH",
  /**
   * Pay to Witness Script Hash
   * Native SEGWIT with Bech32
   */
  P2WSH = "P2WSH",
  /**
   * Pay to Script Hash
   */
  P2SH = "P2SH",
  /**
   * Pay to Public Key Hash
   * Also known as legacy
   */
  P2PKH = "P2PKH",
  /**
   * Ethereum address
   */
  ETH = "ETH",
}

export interface EthDecodedAddress {
  type: AddressType;
  address: string;
  script: Script;
  network: NetworkName;
}

export function getDecodedAddress(
  script: Script,
  network: NetworkName,
): EthDecodedAddress | undefined {
  try {
    // check if is dfc address first
    const decodedAddress = fromScript(script, network);
    if (decodedAddress !== undefined) {
      return decodedAddress;
    }

    // check if eth address
    /* SAMPLE of script object
    "script": {
      "stack": [
        {
          "type": "OP_0",
          "code": 0
        },
        {
          "type": "OP_PUSHDATA",
          "hex": "f23d101c17445dba29b99f5c82186990b2b2c6bf"
        }
      ]
    },
    */

    // extract script OPCodes and Hex
    const decodedEthAddress = Eth.fromScript(script);
    if (decodedEthAddress !== undefined) {
      return {
        type: AddressType.ETH,
        address: `0x${decodedEthAddress}`,
        script,
        network,
      };
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
}

export function getAddressType(
  address: string,
  network: NetworkName,
): AddressType | undefined {
  try {
    // check if is dfc address first
    const decodedAddress = fromAddress(address, network);
    if (decodedAddress !== undefined) {
      return decodedAddress.type;
    }

    // check if the address is evm
    const isEVMAddress = ethers.utils.isAddress(address);
    if (isEVMAddress) {
      return AddressType.ETH;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}
