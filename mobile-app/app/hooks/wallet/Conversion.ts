import { DependencyList, Dispatch, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  transactionQueue,
  unifiedDFISelector,
} from "@waveshq/walletkit-ui/dist/store";
import {
  ConversionMode,
  dfiConversionCrafter,
} from "@api/transaction/dfi_converter";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";

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
  const client = useWhaleApiClient();
  const logger = useLogger();
  const [isConversionRequired, setIsConversionRequired] = useState(false);
  const [conversionAmount, setConversionAmount] = useState(new BigNumber("0"));
  const DFIUnified = useSelector((state: RootState) =>
    unifiedDFISelector(state.wallet)
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet)
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet)
  );
  const unifiedAmount = new BigNumber(DFIUnified.amount);
  const reservedDFI = 0.1;

  useEffect(() => {
    function setAmount(transactionFee: BigNumber) {
      setConversionAmount(
        amount
          .minus(type === "utxo" ? DFIUtxo.amount : DFIToken.amount)
          .plus(type === "utxo" ? reservedDFI : 0)
          .plus(type === "utxo" ? transactionFee : 0)
      );
    }

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
      client.fee
        .estimate()
        .then((f) => {
          setAmount(new BigNumber(f));
        })
        .catch((e) => {
          logger.error(e);
          setAmount(new BigNumber(0.0001));
        });

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
  { mode, amount }: { mode: ConversionMode; amount: BigNumber },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps,
  onConfirmation: () => void = () => {}
): void {
  try {
    dispatch(
      transactionQueue.actions.push(
        dfiConversionCrafter(
          amount,
          mode,
          onBroadcast,
          onConfirmation,
          "CONVERTING"
        )
      )
    );
  } catch (e) {
    logger.error(e);
  }
}
