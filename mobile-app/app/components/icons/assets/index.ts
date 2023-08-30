import { SvgProps } from "react-native-svg";
import { _Default } from "./_Default";
import { dBCH } from "./dBCH";
import { dBTC } from "./dBTC";
import { BTC } from "./BTC";
import { dDOGE } from "./dDOGE";
import { dETH } from "./dETH";
import { DFI } from "./DFI";
import { dLTC } from "./dLTC";
import { dUSDC } from "./dUSDC";
import { dUSDT } from "./dUSDT";
import { dUSD } from "./dUSD";
import { DFIlogo } from "./plainDFI";
import { dEUROC } from "./dEUROC";
import { DOT } from "./DOT";
import { SOL } from "./SOL";
import { MATIC } from "./MATIC";
import { dDOT } from "./dDOT";
import { dMATIC } from "./dMATIC";
import { dSOL } from "./dSOL";
import { dSUI } from "./dSUI";
import { XCHF } from "./XCHF";
import { dXCHF } from "./dXCHF";

const mapping: Record<string, (props: SvgProps) => JSX.Element> = {
  _UTXO: DFI,
  DFI: DFI,
  "DFI (UTXO)": DFI,
  "DFI (Token)": DFI,
  BTC: BTC,
  DOT: DOT,
  MATIC: MATIC,
  SOL: SOL,
  dBCH: dBCH,
  dBTC: dBTC,
  dDFI: DFI,
  dDOGE: dDOGE,
  dETH: dETH,
  dLTC: dLTC,
  dUSDT: dUSDT,
  dUSDC: dUSDC,
  dDUSD: dUSD,
  DUSD: dUSD,
  dEUROC: dEUROC,
  DFIlogo: DFIlogo,
  dDOT: dDOT,
  dMATIC: dMATIC,
  dSOL: dSOL,
  dSUI: dSUI,
  XCHF: XCHF,
  dXCHF: dXCHF,
};

/**
 * @param {string} symbol of the native asset icon
 * @return {(props: SvgProps) => JSX.Element}
 */
export function getNativeIcon(
  symbol: string
): (props: SvgProps) => JSX.Element {
  const Icon = mapping[symbol];
  if (Icon === undefined) {
    return _Default(symbol);
  }
  return Icon;
}
