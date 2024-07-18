import { WalletToken } from "@waveshq/walletkit-ui/dist/store";

export function dusdt_converter(token: WalletToken): WalletToken {
  return { ...token, displaySymbol: "csUSDT" };
}
