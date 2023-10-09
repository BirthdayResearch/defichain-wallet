import { DependencyList, Dispatch, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  unifiedDFISelector,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { dfiConversionCrafter } from "@api/transaction/dfi_converter";
import { NativeLoggingProps } from "@shared-contexts/NativeLoggingProvider";
import { ConvertDirection } from "@screens/enum";

interface useConversionProps {
  inputToken: InputToken;
  deps?: DependencyList;
}

interface InputToken {
  type: TokenType;
  amount: BigNumber;
}

type TokenType = "utxo" | "token" | "others";

interface ConversionResult {
  isConversionRequired: boolean;
  conversionAmount: BigNumber;
}

export function useConversion(props: useConversionProps): ConversionResult {
  const { type, amount } = props.inputToken;
  const [isConversionRequired, setIsConversionRequired] = useState(false);
  const [conversionAmount, setConversionAmount] = useState(new BigNumber("0"));
  const DFIUnified = useSelector((state: RootState) =>
    unifiedDFISelector(state.wallet),
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet),
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet),
  );
  const unifiedAmount = new BigNumber(DFIUnified.amount);
  const reservedDFI = 0.1;

  useEffect(() => {
    if (type === "others") {
      setIsConversionRequired(false);
      return;
    }

    if (
      !amount.isNaN() &&
      amount
        .plus(type === "utxo" ? reservedDFI : 0)
        .isGreaterThan(type === "utxo" ? DFIUtxo.amount : DFIToken.amount) &&
      amount.plus(reservedDFI).isLessThanOrEqualTo(unifiedAmount)
    ) {
      setConversionAmount(
        amount
          .minus(type === "utxo" ? DFIUtxo.amount : DFIToken.amount)
          .plus(type === "utxo" ? reservedDFI : 0),
      );
      setIsConversionRequired(true);
    } else {
      setIsConversionRequired(false);
    }
  }, props.deps);

  return {
    isConversionRequired,
    conversionAmount,
  };
}

export function queueConvertTransaction(
  { mode, amount }: { mode: ConvertDirection; amount: BigNumber },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps,
  onConfirmation: () => void = () => {},
): void {
  try {
    dispatch(
      transactionQueue.actions.push(
        dfiConversionCrafter(
          amount,
          mode,
          onBroadcast,
          onConfirmation,
          "CONVERTING",
        ),
      ),
    );
  } catch (e) {
    logger.error(e);
  }
}
