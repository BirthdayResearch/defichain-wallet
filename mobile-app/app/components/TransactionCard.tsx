import {
  ThemedProps,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import BigNumber from "bignumber.js";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { StyleProp, ViewStyle } from "react-native";
import { useState } from "react";

interface TransactionCardProps {
  maxValue: BigNumber;
  onChange: (amount: string, type: AmountButtonTypes) => void;
  status?: TransactionCardStatus;
  componentStyle?: ThemedProps & { style?: ThemedProps & StyleProp<ViewStyle> };
  containerStyle?: ThemedProps & { style?: ThemedProps & StyleProp<ViewStyle> };
  amountButtonsStyle?: ThemedProps & {
    style?: ThemedProps & StyleProp<ViewStyle>;
  };
  showAmountsBtn?: boolean;
  disabled?: boolean;
}

export enum AmountButtonTypes {
  TwentyFive = "25%",
  Half = "50%",
  SeventyFive = "75%",
  Max = "MAX",
}

export enum TransactionCardStatus {
  Default,
  Active,
  Error,
}

export function TransactionCard({
  maxValue,
  onChange,
  status,
  componentStyle,
  containerStyle,
  amountButtonsStyle,
  disabled,
  showAmountsBtn = true,
  children,
}: React.PropsWithChildren<TransactionCardProps>): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      light={
        componentStyle?.light ??
        tailwind("bg-mono-light-v2-00", {
          "border-0.5 border-mono-light-v2-800":
            status === TransactionCardStatus.Active,
        })
      }
      dark={
        componentStyle?.dark ??
        tailwind("bg-mono-dark-v2-00", {
          "border-0.5 border-mono-dark-v2-800":
            status === TransactionCardStatus.Active,
        })
      }
      style={[
        tailwind("rounded-lg-v2", {
          "border-0.5 border-red-v2": status === TransactionCardStatus.Error,
        }),
        componentStyle?.style,
      ]}
    >
      <ThemedViewV2
        light={containerStyle?.light ?? tailwind("bg-mono-light-v2-00")}
        dark={containerStyle?.dark ?? tailwind("bg-mono-dark-v2-00")}
        style={containerStyle?.style}
      >
        {children}
      </ThemedViewV2>
      {showAmountsBtn && (
        <ThemedViewV2
          light={
            amountButtonsStyle?.light ?? tailwind("border-mono-light-v2-300")
          }
          dark={amountButtonsStyle?.dark ?? tailwind("border-mono-dark-v2-300")}
          style={[
            tailwind("flex flex-row justify-center items-center py-2"),
            amountButtonsStyle?.style,
          ]}
        >
          {Object.values(AmountButtonTypes).map((type, index, { length }) => {
            return (
              <SetAmountButton
                key={type}
                amount={maxValue}
                onPress={onChange}
                type={type}
                hasBorder={length - 1 !== index}
                disabled={disabled}
              />
            );
          })}
        </ThemedViewV2>
      )}
    </ThemedViewV2>
  );
}

interface SetAmountButtonProps {
  type: AmountButtonTypes;
  onPress: (amount: string, type: AmountButtonTypes) => void;
  amount: BigNumber;
  hasBorder?: boolean;
  disabled?: boolean;
}

function SetAmountButton({
  type,
  onPress,
  amount,
  hasBorder,
  disabled,
}: SetAmountButtonProps): JSX.Element {
  const { tailwind } = useStyles();
  const decimalPlace = 8;
  let value = amount.toFixed(decimalPlace);
  const [isPressed, setIsPressed] = useState(false);

  switch (type) {
    case AmountButtonTypes.TwentyFive:
      value = amount.multipliedBy(0.25).toFixed(decimalPlace);
      break;
    case AmountButtonTypes.Half:
      value = amount.multipliedBy(0.5).toFixed(decimalPlace);
      break;
    case AmountButtonTypes.SeventyFive:
      value = amount.multipliedBy(0.75).toFixed(decimalPlace);
      break;
    case AmountButtonTypes.Max:
      value = amount.toFixed(decimalPlace);
      break;
  }

  return (
    <ThemedTouchableOpacityV2
      style={tailwind("border-0")}
      onPress={() => {
        onPress(value, type);
      }}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      testID={`${type}_amount_button`}
      disabled={disabled}
    >
      <ThemedViewV2
        light={tailwind("border-mono-light-v2-300")}
        dark={tailwind("border-mono-dark-v2-300")}
        style={tailwind({ "border-r-0.5": hasBorder })}
      >
        <ThemedViewV2
          light={tailwind({
            "bg-mono-light-v2-100 rounded-lg-v2": isPressed,
          })}
          dark={tailwind({
            "bg-mono-dark-v2-100 rounded-lg-v2": isPressed,
          })}
          style={tailwind("mx-1")}
        >
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-700", {
              "opacity-30": disabled,
            })}
            dark={tailwind("text-mono-dark-v2-700", {
              "opacity-30": disabled,
            })}
            style={tailwind("font-semibold-v2 text-xs px-6 py-1")}
          >
            {translate("component/max", type)}
          </ThemedTextV2>
        </ThemedViewV2>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  );
}
