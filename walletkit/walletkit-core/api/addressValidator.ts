import { fromAddress } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";

export const validateAddress = (
  address: string,
  network: NetworkName,
): boolean => {
  const decodedAddress = fromAddress(address, network);
  return decodedAddress !== undefined;
};
