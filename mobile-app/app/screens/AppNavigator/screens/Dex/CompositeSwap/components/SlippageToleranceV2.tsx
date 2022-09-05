import {
  ThemedViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedIcon,
} from "@components/themed";
import BigNumber from "bignumber.js";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useState, useEffect } from "react";
import { View } from "react-native";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { debounce } from "lodash";
export interface SlippageError {
  type: "error" | "helper";
  text?: string;
}
interface SlippageToleranceCardProps {
  setSlippageError: (error?: SlippageError) => void;
  slippage: BigNumber;
  onSubmitSlippage: (val: BigNumber, isCustomSlippage: boolean) => void;
  onPress: () => void;
}

export enum SlippageAmountButtonTypes {
  ZeroPointFive = "0.5",
  One = "1",
  Three = "3",
}

export enum TransactionCardStatus {
  Default,
  Active,
  Error,
}

export function SlippageToleranceV2({
  setSlippageError,
  slippage,
  onSubmitSlippage,
  onPress,
}: React.PropsWithChildren<SlippageToleranceCardProps>): JSX.Element {
  const [selectedSlippage, setSelectedSlippage] = useState(slippage.toString());
  const [isRiskWarningDisplayed, setIsRiskWarningDisplayed] = useState(false);
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  const validateSlippage = (value: string): void => {
    if (value === undefined || value === "") {
      setSlippageError({
        type: "error",
        text: translate(
          "screens/SlippageTolerance",
          "Required field is missing"
        ),
      });
      return;
    } else if (
      !(new BigNumber(value).gte(0) && new BigNumber(value).lte(100))
    ) {
      setSlippageError({
        type: "error",
        text: translate(
          "screens/SlippageTolerance",
          "Slippage rate must range from 0-100%"
        ),
      });
      return;
    }

    setSlippageError(undefined);
  };

  useEffect(() => {
    validateSlippage(selectedSlippage);
    setIsRiskWarningDisplayed(
      new BigNumber(selectedSlippage).gte(20) &&
        new BigNumber(selectedSlippage).lte(100)
    );
  }, [selectedSlippage]);

  const submitSlippage = debounce(onSubmitSlippage, 500);
  const onSlippageChange = (value: string): void => {
    setSelectedSlippage(value);
    submitSlippage(new BigNumber(value), isCustomSlippage);
  };

  return (
    <>
      <View style={tailwind("flex-row items-center pb-2 px-5")}>
        <ThemedTextV2
          style={tailwind("text-xs font-normal-v2")}
          dark={tailwind("text-mono-dark-v2-500")}
          light={tailwind("text-mono-light-v2-500")}
        >
          {translate("screens/CompositeSwapScreen", "SLIPPAGE TOLERANCE")}
        </ThemedTextV2>
        <ThemedTouchableOpacityV2
          style={tailwind("pl-1")}
          onPress={onPress}
          testID="slippage_info_button"
        >
          <ThemedIcon
            name="info-outline"
            iconType="MaterialIcons"
            size={16}
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
          />
        </ThemedTouchableOpacityV2>
      </View>
      {isCustomSlippage ? (
        <View style={tailwind("flex-row")}>
          <ThemedViewV2
            light={tailwind("bg-mono-light-v2-00")}
            dark={tailwind("bg-mono-dark-v2-00 bg-red-100")}
            style={tailwind(
              "flex flex-row items-center rounded-full mr-2 w-9/12"
            )}
          >
            <WalletTextInputV2 // TODO:need to recreate this or modified the component to fit the design
              onChangeText={(val) => onSlippageChange(val)}
              keyboardType="numeric"
              autoCapitalize="none"
              placeholder="0.00%"
              style={tailwind("")}
              inputContainerStyle={tailwind("")}
              testID="slippage_input"
              value={selectedSlippage !== undefined ? selectedSlippage : ""}
              displayClearButton={selectedSlippage !== ""}
              onClearButtonPress={() => {
                setIsCustomSlippage(false);
                onSlippageChange("");
              }}
              inputType="numeric"
            />
          </ThemedViewV2>
          <ThemedTouchableOpacityV2
            light={tailwind("bg-mono-light-v2-900")}
            dark={tailwind("bg-mono-dark-v2-900")}
            style={tailwind(
              "p-2.5 flex justify-center items-center flex-grow rounded-full"
            )}
            onPress={() => {
              setIsCustomSlippage(false);
              setIsCustomAmount(selectedSlippage !== "");
            }}
          >
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-100")}
              dark={tailwind("text-mono-dark-v2-100")}
              style={tailwind("text-xs font-semibold-v2")}
            >
              {translate("components/CompositeSwapScreen", "Set")}
            </ThemedTextV2>
          </ThemedTouchableOpacityV2>
        </View>
      ) : (
        <ThemedViewV2
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
          style={tailwind(
            "flex flex-row justify-around items-center rounded-full"
          )}
        >
          {Object.values(SlippageAmountButtonTypes).map((type, index) => {
            return (
              <PercentageAmountButton
                key={type}
                onPress={() => {
                  onSlippageChange(type);
                  setIsCustomAmount(false);
                }}
                percentageAmount={type}
                isSelected={
                  !isCustomAmount && selectedSlippage.toString() === type
                }
              />
            );
          })}
          <CustomAmountButton
            setIsCustomSlippage={() => setIsCustomSlippage(true)}
            isCustomAmount={isCustomAmount}
            customAmount={selectedSlippage}
          />
        </ThemedViewV2>
      )}
      {isRiskWarningDisplayed && (
        <ThemedTextV2
          light={tailwind("text-warning-600")}
          dark={tailwind("text-darkwarning-600")}
          style={tailwind("font-normal-v2 text-xs mt-2 mx-5")}
          testID="slippage_warning"
        >
          {translate(
            "screens/SlippageTolerance",
            "Set high tolerance at your own risk"
          )}
        </ThemedTextV2>
      )}
    </>
  );
}

interface PercentageAmountButtonProps {
  onPress: () => void;
  percentageAmount: SlippageAmountButtonTypes;
  isSelected: boolean;
}
function PercentageAmountButton({
  onPress,
  percentageAmount,
  isSelected,
}: PercentageAmountButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      light={tailwind({ "bg-mono-light-v2-900": isSelected })}
      dark={tailwind({ "bg-mono-dark-v2-900": isSelected })}
      style={tailwind("w-3/12 items-center rounded-full")}
      onPress={onPress}
    >
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700", {
          "text-mono-light-v2-100": isSelected,
        })}
        dark={tailwind("text-mono-dark-v2-700", {
          "text-mono-dark-v2-100": isSelected,
        })}
        style={tailwind("text-xs px-4 py-2.5")}
      >
        {percentageAmount}%
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}

interface CustomAmountButtonProps {
  isCustomAmount: boolean;
  customAmount: string;
  setIsCustomSlippage: () => void;
}

function CustomAmountButton({
  isCustomAmount,
  customAmount,
  setIsCustomSlippage,
}: CustomAmountButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      light={tailwind("bg-transparent", {
        "bg-mono-light-v2-900": isCustomAmount,
      })}
      dark={tailwind("bg-transparent", {
        "bg-mono-light-v2-900": isCustomAmount,
      })}
      style={tailwind("rounded-r-full w-3/12 items-center", {
        "rounded-l-full": isCustomAmount,
      })}
      onPress={setIsCustomSlippage}
    >
      <ThemedViewV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind(
          "font-semibold-v2 text-xs px-4 py-2.5 flex-row items-center"
        )}
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-500", {
            "text-mono-light-v2-100": isCustomAmount,
          })}
          dark={tailwind("text-mono-dark-v2-500", {
            "text-mono-dark-v2-100": isCustomAmount,
          })}
          style={tailwind("text-xs", { "pr-1.5": isCustomAmount })}
        >
          {isCustomAmount ? `${customAmount}%` : "Custom"}
        </ThemedTextV2>
        {isCustomAmount && (
          <ThemedIcon
            name="edit-2"
            size={16}
            iconType="Feather"
            dark={tailwind("text-mono-dark-v2-100")}
            light={tailwind("text-mono-light-v2-100")}
          />
        )}
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  );
}
