import BigNumber from "bignumber.js";
import NumberFormat from "react-number-format";
import { tailwind } from "@tailwind";
import { getNativeIcon } from "@components/icons/assets";
import { translate } from "@translations";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { AddressType } from "@store/wallet";
import { View } from "react-native";
import { ThemedTextV2, ThemedViewV2 } from "./themed";

interface ConfirmSummaryTitleV2Props {
  title: string;
  fromTokenAmount: BigNumber;
  testID: string;
  fromAddress: string;
  fromAddressLabel?: string | null;
  toAddress?: string;
  toAddressLabel?: string | null;
  iconA: string;
  iconB: string;
  addressType?: AddressType;
  toTokenAmount: BigNumber;
  isFutureSwap: boolean;
  oraclePrice?: string;
}

export function ConfirmSummaryTitleV2(
  props: ConfirmSummaryTitleV2Props
): JSX.Element {
  const IconA = getNativeIcon(props.iconA);
  const IconB = getNativeIcon(props.iconB);

  return (
    <>
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-500")}
        light={tailwind("text-mono-light-v2-500")}
        style={tailwind("text-xs font-normal-v2")}
        testID="confirm_title"
      >
        {props.title}
      </ThemedTextV2>

      <View style={tailwind("flex-col")}>
        <View style={tailwind("flex-row items-center mt-2")}>
          <IconA height={32} width={32} />
          <NumberFormat
            decimalScale={8}
            displayType="text"
            renderText={(value) => (
              <ThemedTextV2
                style={tailwind("text-xl font-semibold-v2 flex-wrap pr-1 pl-2")}
                testID={`${props.testID}_from`}
              >
                {value}
              </ThemedTextV2>
            )}
            thousandSeparator
            value={props.fromTokenAmount.toFixed(8)}
          />
        </View>

        <View style={tailwind("mt-3")}>
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2")}
            dark={tailwind("text-mono-dark-v2-500")}
            light={tailwind("text-mono-light-v2-500")}
          >
            {translate("screens/common", "for")}
          </ThemedTextV2>
          <View style={tailwind("flex-row items-center mt-2")}>
            <IconB height={32} width={32} />
            {props.isFutureSwap ? (
              <View style={tailwind("flex-col flex-1 pl-2")}>
                <ThemedTextV2
                  style={tailwind("font-semibold-v2 text-xl")}
                  testID={`${props.testID}_to_unit`}
                >
                  {props.iconB}
                </ThemedTextV2>
                <ThemedTextV2
                  style={tailwind("font-normal-v2 text-xs")}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                >
                  {translate(
                    "screens/ConfirmCompositeSwapScreen",
                    "Settlement value {{percentageChange}}",
                    { percentageChange: props.oraclePrice }
                  )}
                </ThemedTextV2>
              </View>
            ) : (
              <NumberFormat
                decimalScale={8}
                displayType="text"
                renderText={(value) => (
                  <ThemedTextV2
                    style={tailwind(
                      "text-xl font-semibold-v2 flex-wrap pr-1 pl-2"
                    )}
                    testID={`${props.testID}_to`}
                  >
                    {value}
                  </ThemedTextV2>
                )}
                thousandSeparator
                value={props.toTokenAmount.toFixed(8)}
              />
            )}
          </View>
        </View>

        <View style={tailwind("flex-row items-center mt-5")}>
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2")}
            dark={tailwind("text-mono-dark-v2-500")}
            light={tailwind("text-mono-light-v2-500")}
          >
            {translate("screens/common", "From")}
          </ThemedTextV2>
          <ThemedViewV2
            dark={tailwind("bg-mono-dark-v2-200")}
            light={tailwind("bg-mono-light-v2-200")}
            style={tailwind(
              "rounded-full pl-1 pr-2.5 py-1 flex flex-row items-center overflow-hidden ml-2"
            )}
          >
            <RandomAvatar name={props.fromAddress} size={20} />
            <ThemedTextV2
              ellipsizeMode="middle"
              numberOfLines={1}
              style={[
                tailwind("text-sm font-normal-v2 ml-1"),
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  minWidth: 10,
                  maxWidth: 108,
                },
              ]}
              testID="wallet_address"
            >
              {props.fromAddressLabel ?? props.fromAddress}
            </ThemedTextV2>
          </ThemedViewV2>
        </View>

        {props.toAddress !== undefined && props.addressType !== undefined && (
          <View
            style={tailwind("flex-row items-center mt-4")}
            testID="summary_to_view"
          >
            <ThemedTextV2
              style={tailwind("text-xs font-normal-v2")}
              dark={tailwind("text-mono-dark-v2-500")}
              light={tailwind("text-mono-light-v2-500")}
            >
              {translate("screens/common", "To")}
            </ThemedTextV2>
            <ThemedViewV2
              dark={tailwind("bg-mono-dark-v2-200")}
              light={tailwind("bg-mono-light-v2-200")}
              style={tailwind(
                "flex flex-row items-center overflow-hidden rounded-full pr-2.5 py-1 ml-2",
                {
                  "pl-1": props.addressType === AddressType.WalletAddress,
                  "pl-2.5": props.addressType !== AddressType.WalletAddress,
                }
              )}
            >
              {props.addressType === AddressType.WalletAddress && (
                <View style={tailwind("mr-1")}>
                  <RandomAvatar name={props.toAddress} size={20} />
                </View>
              )}
              <ThemedTextV2
                ellipsizeMode="middle"
                numberOfLines={1}
                style={[
                  tailwind("text-sm font-normal-v2"),
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    minWidth: 10,
                    maxWidth: 108,
                  },
                ]}
                testID="summary_to_value"
              >
                {props.toAddressLabel != null && props.toAddressLabel.length > 0
                  ? props.toAddressLabel
                  : props.toAddress}
              </ThemedTextV2>
            </ThemedViewV2>
          </View>
        )}
      </View>
    </>
  );
}
