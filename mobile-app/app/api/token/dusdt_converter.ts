import { WalletToken } from "@waveshq/walletkit-ui/dist/store";

export function dusdt_converter(token: any): WalletToken {
  return { ...token, displaySymbol: "csUSDT" };
}
