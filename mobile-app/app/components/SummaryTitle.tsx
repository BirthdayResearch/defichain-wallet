import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { tailwind } from "@tailwind";
import { getNativeIcon } from "@components/icons/assets";
import { translate } from "@translations";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { AddressType } from "@waveshq/walletkit-ui/dist/store";
import { LocalAddress, WhitelistedAddress } from "@store/userPreferences";
import { DomainType } from "@contexts/DomainContext";
import { LinearGradient } from "expo-linear-gradient";
import { View } from ".";
import { ThemedTextV2, ThemedViewV2 } from "./themed";
import { EVMLinearGradient } from "./EVMLinearGradient";

interface ISummaryTitleProps {
  title: string;
  amount: BigNumber;
  testID: string;
  fromAddress?: string;
  fromAddressLabel?: string | null;
  toAddress?: string;
  toAddressLabel?: string | null;
  customToAddressTitle?: string;
  iconA: string;
  iconB?: string;
  addressType?: AddressType;
  amountTextStyle?: string;
  matchedAddress?: LocalAddress | WhitelistedAddress;
  isEvmToken?: boolean;
}

export function SummaryTitle(props: ISummaryTitleProps): JSX.Element {
  const IconA = getNativeIcon(props.iconA);
  const IconB =
    props.iconB !== undefined ? getNativeIcon(props.iconB) : undefined;

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
          {IconB !== undefined ? (
            <View style={tailwind("flex-row")}>
              <IconA height={32} width={32} style={tailwind("z-10")} />
              <IconB height={32} width={32} style={tailwind("-ml-3")} />
            </View>
          ) : (
            <EVMLinearGradient isEvmToken={props.isEvmToken}>
              <IconA
                height={props.isEvmToken ? 28 : 32}
                width={props.isEvmToken ? 28 : 32}
              />
            </EVMLinearGradient>
          )}

          <NumberFormat
            displayType="text"
            renderText={(value) => (
              <ThemedTextV2
                style={tailwind(
                  `text-3xl font-semibold-v2 flex-wrap pr-1 pl-2 ${
                    props.amountTextStyle ?? ""
                  }`,
                )}
                testID={props.testID}
              >
                {value}
              </ThemedTextV2>
            )}
            thousandSeparator
            value={props.amount.toFixed(8)}
          />
        </View>

        {props.fromAddress !== undefined && (
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
                "rounded-full pl-1 pr-2.5 py-1 flex flex-row items-center overflow-hidden ml-2",
              )}
            >
              <RandomAvatar name={props.fromAddress} size={20} />
              <ThemedTextV2
                ellipsizeMode="middle"
                numberOfLines={1}
                style={[
                  tailwind("text-sm font-normal-v2 ml-1"),
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
        )}

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
              {props.customToAddressTitle ?? translate("screens/common", "To")}
            </ThemedTextV2>
            {/* TODO @chloe cater for selection of evm addr from addr pair */}
            {(props.matchedAddress as WhitelistedAddress)?.addressDomainType ===
            DomainType.EVM ? (
              <LinearGradient
                colors={["#42F9C2", "#3B57CF"]}
                start={[0, 0]}
                end={[1, 1]}
                style={tailwind(
                  "flex flex-row items-center overflow-hidden rounded-full pr-2.5 py-1 ml-2",
                  {
                    "pl-1": props.addressType === AddressType.WalletAddress,
                    "pl-2.5": props.addressType !== AddressType.WalletAddress,
                  },
                )}
                testID="to_address_label_evm_tag"
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
                    {
                      minWidth: 10,
                      maxWidth: 108,
                    },
                  ]}
                  testID="summary_to_value"
                >
                  {props.toAddressLabel != null &&
                  props.toAddressLabel.length > 0
                    ? props.toAddressLabel
                    : props.toAddress}
                </ThemedTextV2>
              </LinearGradient>
            ) : (
              <ThemedViewV2
                dark={tailwind("bg-mono-dark-v2-200")}
                light={tailwind("bg-mono-light-v2-200")}
                style={tailwind(
                  "flex flex-row items-center overflow-hidden rounded-full pr-2.5 py-1 ml-2",
                  {
                    "pl-1": props.addressType === AddressType.WalletAddress,
                    "pl-2.5": props.addressType !== AddressType.WalletAddress,
                  },
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
                    {
                      minWidth: 10,
                      maxWidth: 108,
                    },
                  ]}
                  testID="summary_to_value"
                >
                  {props.toAddressLabel != null &&
                  props.toAddressLabel.length > 0
                    ? props.toAddressLabel
                    : props.toAddress}
                </ThemedTextV2>
              </ThemedViewV2>
            )}
          </View>
        )}
      </View>
    </>
  );
}
