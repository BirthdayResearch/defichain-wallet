import { OP_CODES, Script } from "@defichain/jellyfish-transaction";

import {
  AddressType,
  EthDecodedAddress,
  getAddressType,
  getDecodedAddress,
} from "./address";

/* detailed `fromScript()` test cases are done in @defichain/jellyfish-address */
describe("Address Decoder", () => {
  it("should be able to decode valid DFC script", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_0,
        OP_CODES.OP_PUSHDATA_HEX_LE(
          "9e1be07558ea5cc8e02ed1d80c0911048afad949affa36d5c3951e3159dbea19",
        ),
      ],
    };

    const expected: EthDecodedAddress = {
      type: AddressType.P2WSH,
      address: "tf1qncd7qa2cafwv3cpw68vqczg3qj904k2f4lard4wrj50rzkwmagvsemeex5",
      script,
      network: "testnet",
    };
    expect(getDecodedAddress(script, "testnet")).toStrictEqual(expected);
  });

  it("should be able to decode valid ETH script", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_16,
        OP_CODES.OP_PUSHDATA_HEX_BE("98bd4c07f8eddf293f81e511921106d0c7f2839d"),
      ],
    };

    const expected: EthDecodedAddress = {
      type: AddressType.ETH,
      address: "0x98bd4c07f8eddf293f81e511921106d0c7f2839d",
      script,
      network: "testnet",
    };

    expect(getDecodedAddress(script, "testnet")).toStrictEqual(expected);
  });

  it("should return undefined for invalid DFC script, if [0] != OP_0", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_1,
        OP_CODES.OP_PUSHDATA_HEX_LE(
          "9e1be07558ea5cc8e02ed1d80c0911048afad949affa36d5c3951e3159dbea19",
        ),
      ],
    };

    expect(getDecodedAddress(script, "testnet")).toBeUndefined();
  });

  it("should return undefined for ETH script, if [1] != OP_PUSHDATA", () => {
    const script: Script = {
      stack: [OP_CODES.OP_16, OP_CODES.OP_RETURN],
    };

    expect(getDecodedAddress(script, "testnet")).toBeUndefined();
  });

  it("should return undefined for invalid ETH hex", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_16,
        OP_CODES.OP_PUSHDATA_HEX_LE(
          "9e1be07558ea5cc8e02ed1d80c0911048afad949affa36d5c3951e3159dbea19",
        ),
      ],
    };

    expect(getDecodedAddress(script, "testnet")).toBeUndefined();
  });
});

describe("Get Address Type", () => {
  const addresses = [
    {
      address: "tf1qzvvn8rp2q93w5rf9afpjjm2w2wtuu2fnvl6j3p",
      type: AddressType.P2WPKH,
    },
    {
      address: "tf1qncd7qa2cafwv3cpw68vqczg3qj904k2f4lard4wrj50rzkwmagvsemeex5",
      type: AddressType.P2WSH,
    },
    { address: "77nPza1LqwQzS9jMCnxVV3xKYWnLLZePwo", type: AddressType.P2PKH },
    { address: "tkwD8teFiwr9fGwwX2KfgrgYRbwEiWmMJw", type: AddressType.P2SH },
    {
      address: "0xe36f18af5bFfDcB442E84970408F68570aB88F52",
      type: AddressType.ETH,
    },
  ];

  addresses.forEach(({ address, type }) => {
    it(`should be able to get valid ${type} address type`, () => {
      expect(getAddressType(address, "testnet")).toStrictEqual(type);
    });
  });

  it(`should be able to get valid undefined with wrong address`, () => {
    expect(
      getAddressType("bcrt1q6cxskutl6jf0jjeqxc3ymfuqakhw4r247tht58", "testnet"),
    ).toStrictEqual(undefined);
  });
});
