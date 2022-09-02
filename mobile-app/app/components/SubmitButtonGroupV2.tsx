import { View } from "react-native";
import { translate } from "@translations";
import { RootState } from "@store";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  TRY_AGAIN_TIMER_COUNT,
  UNEXPECTED_FAILURE,
} from "@screens/TransactionAuthorization/api/transaction_types";
import { useNonInitialEffect } from "@hooks/useNonInitialEffect";
import { ButtonV2 } from "@components/ButtonV2";
import { tailwind } from "@tailwind";
import { Button } from "./Button";

interface SubmitButtonGroupItems {
  isDisabled: boolean;
  isCancelDisabled?: boolean;
  title: string;
  label: string;
  displayCancelBtn: boolean;
  buttonStyle?: string;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
}

export function SubmitButtonGroupV2({
  buttonStyle,
  isDisabled,
  isCancelDisabled,
  displayCancelBtn,
  title,
  label,
  onSubmit,
  onCancel,
}: SubmitButtonGroupItems): JSX.Element {
  const error = useSelector((state: RootState) => state.transactionQueue.err);
  const [intervalId, setIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [tryAgain, setTryAgain] = useState(false);

  // avoid setting up try again button on initial load
  useNonInitialEffect(() => {
    if (error?.message === UNEXPECTED_FAILURE) {
      setTryAgain(true);
    }
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [error]);

  const submit = (): void => {
    let count = TRY_AGAIN_TIMER_COUNT;
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    void onSubmit();
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      count -= 1;
      if (count < 0) {
        updateTryAgainStat();
        clearInterval(id);
        setIntervalId(null);
      }
    }, 1000);
    setIntervalId(id);
  };

  const updateTryAgainStat = (): void => {
    if (error?.message === UNEXPECTED_FAILURE) {
      return setTryAgain(true);
    }
  };

  // const getSubmittingLabel = (): string | undefined => {
  //   if (counter === null && processingLabel !== undefined) {
  //     return processingLabel
  //     return processingLabel
  //   }
  //   if (processingLabel !== undefined) {
  //     return `${processingLabel} (${counter ?? '-'})`
  //   }
  //   return undefined
  // }

  return (
    <View style={tailwind("w-full")}>
      {tryAgain ? (
        <Button
          label={translate("screens/common", "TRY AGAIN")}
          onPress={() => {
            submit();
            setTryAgain(false);
          }}
          testID={`button_try_again_${title}`}
          title={translate("screens/common", "TRY AGAIN")}
          disabled={isDisabled}
        />
      ) : (
        <ButtonV2
          disabled={isDisabled}
          label={translate("screens/common", label)}
          onPress={submit}
          testID={`button_confirm_${title}`}
          styleProps={buttonStyle}
        />
      )}

      {displayCancelBtn && (
        <ButtonV2
          disabled={
            isCancelDisabled === undefined ? isDisabled : isCancelDisabled
          }
          fillType="flat"
          label={translate("screens/common", "Cancel")}
          styleProps="-mt-3"
          onPress={onCancel}
          testID={`button_cancel_${title}`}
        />
      )}
    </View>
  );
}
