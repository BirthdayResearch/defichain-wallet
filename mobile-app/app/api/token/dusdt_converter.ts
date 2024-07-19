export function dusdt_converter_token(token: any) {
  if (token.displayTextSymbol) {
    return { ...token, displaySymbol: "csUSDT", displayTextSymbol: "csUSDT" };
  }
  return { ...token, displaySymbol: "csUSDT" };
}
