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
import { StyleProp, View, ViewStyle } from "react-native";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";

export interface SlippageError {
  type: "error" | "helper";
  text?: string;
  style?: StyleProp<ViewStyle>;
}
interface SlippageToleranceCardProps {
  slippage: BigNumber;
  slippageError?: SlippageError;
  setSlippageError: (error?: SlippageError) => void;
  setSlippage: (val: BigNumber) => void;
  onPress: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
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
  slippage,
  setSlippage,
  slippageError,
  setSlippageError,
  onPress,
  isEditing,
  setIsEditing,
}: React.PropsWithChildren<SlippageToleranceCardProps>): JSX.Element {
  const [selectedSlippage, setSelectedSlippage] = useState(slippage.toFixed(8));
  const [isRiskWarningDisplayed, setIsRiskWarningDisplayed] = useState(false);

  const checkIfCustomSlippage = (slippage: string) => {
    return !Object.values(SlippageAmountButtonTypes).some((buttonAmount) =>
      new BigNumber(new BigNumber(buttonAmount).toFixed(8)).isEqualTo(slippage)
    );
  };

  const [isCustomAmount, setIsCustomAmount] = useState(
    checkIfCustomSlippage(slippage.toFixed(8))
  );

  const isSlippageValid = (): boolean => {
    return slippageError === undefined || slippageError?.type === "helper";
  };

  const validateSlippage = (value: string): void => {
    /* Allow empty custom slippage -> reverts back to previous slippage */
    if (value === undefined || value === "") {
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

  const updateSlippage = (slippage: string, updateLocalStorage: boolean) => {
    // update local storage
    if (updateLocalStorage) {
      setSlippage(new BigNumber(slippage));
    } else {
      // update local state
      setSelectedSlippage(slippage);
    }
  };

  // updates states when there is a change in slippage from local storage
  useEffect(() => {
    // percentage value will be in 2DP
    updateSlippage(slippage.toFixed(2), false);
    setIsCustomAmount(checkIfCustomSlippage(slippage.toFixed(2)));
  }, [slippage]);

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
      {isEditing ? (
        <>
          <View style={tailwind("flex-row")}>
            <View style={tailwind("flex-row items-center mr-2 w-9/12")}>
              <WalletTextInputV2
                onChangeText={(val: string) => {
                  updateSlippage(val, false);
                }}
                keyboardType="numeric"
                autoCapitalize="none"
                style={tailwind("flex-grow w-2/5 font-normal-v2 text-xs")}
                inputContainerStyle={tailwind("h-9")}
                testID="slippage_input"
                value={selectedSlippage !== undefined ? selectedSlippage : ""}
                displayClearButton={selectedSlippage !== ""}
                onClearButtonPress={() => {
                  updateSlippage("", false);
                  setSlippageError(undefined);
                }}
                inputType="numeric"
                inlineText={slippageError}
                valid={isSlippageValid()}
                helperContainerStyle={tailwind("mx-5")}
                borderContainerStyle={tailwind("rounded-2xl-v2")}
              />
            </View>
            <View style={tailwind("flex-1 h-9")}>
              <ThemedTouchableOpacityV2
                light={tailwind("bg-mono-light-v2-900")}
                dark={tailwind("bg-mono-dark-v2-900")}
                style={tailwind(
                  "p-2.5 justify-center items-center flex-grow rounded-full z-10",
                  {
                    "opacity-30": !isSlippageValid(),
                  }
                )}
                onPress={() => {
                  setIsEditing(false);
                  if (
                    selectedSlippage === undefined ||
                    selectedSlippage === ""
                  ) {
                    updateSlippage(slippage.toFixed(2), false); // reset to previous slippage
                  } else {
                    setIsCustomAmount(true);
                    updateSlippage(
                      new BigNumber(selectedSlippage).toFixed(2),
                      true
                    );
                  }
                }}
                disabled={!isSlippageValid()}
                testID="set_slippage_button"
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
          </View>
        </>
      ) : (
        <ThemedViewV2
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
          style={tailwind(
            "flex flex-row justify-around items-center rounded-full"
          )}
        >
          {Object.values(SlippageAmountButtonTypes).map((type) => {
            return (
              <PercentageAmountButton
                key={type}
                onPress={() => {
                  updateSlippage(type, true);
                  setIsCustomAmount(false);
                }}
                percentageAmount={type}
                isSelected={
                  !isCustomAmount &&
                  new BigNumber(selectedSlippage).isEqualTo(
                    new BigNumber(type).toFixed(2)
                  )
                }
              />
            );
          })}
          <CustomAmountButton
            setIsCustomSlippage={() => {
              setIsEditing(true);
            }}
            isCustomAmount={isCustomAmount}
            customAmount={new BigNumber(selectedSlippage).toFixed(2)}
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
      style={tailwind(
        "w-3/12 items-center rounded-full justify-center self-stretch h-9"
      )}
      onPress={onPress}
      testID={`slippage_${percentageAmount}%`}
    >
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700", {
          "text-mono-light-v2-100": isSelected,
        })}
        dark={tailwind("text-mono-dark-v2-700", {
          "text-mono-dark-v2-100": isSelected,
        })}
        style={tailwind("text-xs px-4 py-2.5 font-normal-v2")}
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
        "bg-mono-dark-v2-900": isCustomAmount,
      })}
      style={tailwind("rounded-r-full w-3/12 items-center", {
        "rounded-l-full": isCustomAmount,
      })}
      onPress={setIsCustomSlippage}
      testID="slippage_custom"
    >
      <ThemedViewV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind(
          "font-semibold-v2 text-xs px-4 py-2.5 flex-row items-center h-9"
        )}
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-500", {
            "text-mono-light-v2-100": isCustomAmount,
          })}
          dark={tailwind("text-mono-dark-v2-500", {
            "text-mono-dark-v2-100": isCustomAmount,
          })}
          style={tailwind("text-xs font-normal-v2", {
            "pr-1.5": isCustomAmount,
          })}
          testID="slippage_custom_amount"
        >
          {isCustomAmount
            ? `${customAmount}%`
            : translate("screens/CompositeSwapScreen", "Custom")}
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
