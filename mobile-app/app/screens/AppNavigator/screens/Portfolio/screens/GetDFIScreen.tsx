import * as Clipboard from "expo-clipboard";
import { StackScreenProps } from "@react-navigation/stack";
import { useCallback, useEffect, useState } from "react";
import { Share, TouchableOpacity, View, Text } from "react-native";
import QRCode from "react-qr-code";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useToast } from "react-native-toast-notifications";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { debounce } from "lodash";
import { openURL } from "@api/linking";
import { getNativeIcon } from "@components/icons/assets";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";

export async function onShare(
  address: string,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    await Share.share({
      message: address,
    });
  } catch (error) {
    logger.error(error);
  }
}

type Props = StackScreenProps<PortfolioParamList, "GetDFIScreen">;

export function GetDFIScreen({ navigation }: Props): JSX.Element {
  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("mx-5 pb-24")}
      style={tailwind("flex")}
      testID="get_dfi_screen"
    >
      <StepOne onPress={() => navigation.navigate("MarketplaceScreen")} />
      <StepTwo />
      <DFIOraclePrice />
    </ThemedScrollViewV2>
  );
}

function StepOne({ onPress }: { onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind("mt-8")}>
      <View style={tailwind("px-5 pb-4")}>
        <ThemedTextV2 style={tailwind("text-xs font-normal-v2")}>
          {translate("screens/GetDFIScreen", "STEP 1")}
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind("font-normal-v2")}>
          {translate("screens/GetDFIScreen", "Trade/Purchase DFI")}
        </ThemedTextV2>
      </View>
      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("rounded-lg-v2")}
      >
        <ThemedTouchableOpacityV2
          style={tailwind(
            "flex flex-row items-center justify-between py-4.5 ml-5 mr-4"
          )}
          onPress={onPress}
          testID="get_exchanges"
        >
          <ThemedTextV2 style={tailwind("text-sm font-normal-v2")}>
            {translate("screens/GetDFIScreen", "Marketplace")}
          </ThemedTextV2>
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            iconType="Feather"
            name="chevron-right"
            size={18}
          />
        </ThemedTouchableOpacityV2>
      </ThemedViewV2>
      <TouchableOpacity
        onPress={async () => await openURL("https://defichain.com/dfi")}
        style={tailwind("flex flex-row items-center mx-5 mt-2")}
      >
        <ThemedIcon
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
          iconType="MaterialCommunityIcons"
          name="help-circle"
          size={18}
        />
        <ThemedTextV2 style={tailwind("text-xs font-semibold-v2 ml-1")}>
          {translate("screens/GetDFIScreen", "Learn more about DFI")}
        </ThemedTextV2>
      </TouchableOpacity>
    </View>
  );
}

function StepTwo(): JSX.Element {
  const logger = useLogger();
  const { isLight } = useThemeContext();
  const { address } = useWalletContext();
  const [showToast, setShowToast] = useState(false);
  const toast = useToast();
  const TOAST_DURATION = 2000;

  const copyToClipboard = useCallback(
    debounce(() => {
      if (showToast) {
        return;
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
    }, 500),
    [showToast]
  );

  useEffect(() => {
    if (showToast) {
      toast.show(translate("components/toaster", "Copied"), {
        type: "wallet_toast",
        placement: "top",
        duration: TOAST_DURATION,
      });
    } else {
      toast.hideAll();
    }
  }, [showToast, address]);

  return (
    <View style={tailwind("mt-8 px-5")}>
      <View style={tailwind("pb-4")}>
        <ThemedTextV2 style={tailwind("text-xs font-normal-v2")}>
          {translate("screens/GetDFIScreen", "STEP 2")}
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind("font-normal-v2")}>
          {translate("screens/GetDFIScreen", "Receive DFI in DeFiChain Wallet")}
        </ThemedTextV2>
      </View>
      <View style={tailwind("flex flex-row")}>
        <View style={tailwind("items-center")}>
          <ThemedViewV2
            style={tailwind("rounded-lg p-2 drop-shadow-lg")}
            testID="qr_code_container"
            dark={tailwind("bg-mono-light-v2-00")}
            light={tailwind("bg-mono-light-v2-00")}
          >
            <QRCode size={106} value={address} />
          </ThemedViewV2>
        </View>
        <View style={tailwind("pl-5 justify-between flex-1 flex-wrap")}>
          <ThemedTextV2
            style={tailwind("font-normal-v2 mb-px text-xs")}
            dark={tailwind("text-mono-dark-v2-500")}
            light={tailwind("text-mono-light-v2-500")}
            testID="wallet_address"
          >
            {translate("screens/GetDFIScreen", "WALLET ADDRESS")}
          </ThemedTextV2>
          <TouchableOpacity
            onPress={async () => {
              copyToClipboard();
              await Clipboard.setStringAsync(address);
            }}
            style={tailwind("w-full flex flex-row")}
            testID="copy_button"
          >
            <ThemedTextV2
              numberOfLines={3}
              ellipsizeMode="middle"
              selectable
              testID="address_text"
              style={tailwind("text-sm font-normal-v2")}
            >
              <Text>{address} </Text>
              <CopyIcon />
            </ThemedTextV2>
          </TouchableOpacity>
          <View style={tailwind("items-start")}>
            <TouchableOpacity
              onPress={async () => {
                await onShare(address, logger);
              }}
              style={tailwind(
                `px-4 py-2 mt-2 border rounded-full ${
                  isLight
                    ? "border-mono-light-v2-700"
                    : "border-mono-dark-v2-700"
                }`
              )}
              testID="share_button"
            >
              <ThemedTextV2
                dark={tailwind("text-mono-dark-v2-700")}
                light={tailwind("text-mono-light-v2-700")}
                style={tailwind("text-xs font-normal-v2 text-center")}
              >
                {translate("screens/GetDFIScreen", "Share")}
              </ThemedTextV2>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function DFIOraclePrice(): JSX.Element {
  const [price, setPrice] = useState("0");
  const client = useWhaleApiClient();
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const logger = useLogger();
  const DFITokenIcon = getNativeIcon("_UTXO");

  useEffect(() => {
    client.prices
      .get("DFI", "USD")
      .then((value) => {
        setPrice(value.price.aggregated.amount);
      })
      .catch(logger.error);
  }, [blockCount]);

  return (
    <ThemedViewV2
      dark={tailwind("border-mono-dark-v2-900")}
      light={tailwind("border-mono-light-v2-900")}
      style={tailwind(
        "flex flex-row items-center justify-between rounded-lg mt-10 px-5 py-4.5 border-0.5"
      )}
    >
      <TouchableOpacity
        onPress={async () => await openURL("https://defiscan.live")}
        style={tailwind("flex flex-row items-center")}
      >
        <DFITokenIcon width={24} height={24} style={tailwind("mr-2")} />
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-900")}
          dark={tailwind("text-mono-dark-v2-900")}
          style={tailwind("text-sm font-semibold-v2 mr-2")}
        >
          {translate("screens/GetDFIScreen", "DFI price")}
        </ThemedTextV2>
        <ThemedIcon
          size={18}
          name="open-in-new"
          iconType="MaterialIcons"
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
        />
      </TouchableOpacity>
      <NumberFormat
        displayType="text"
        prefix="$"
        renderText={(val: string) => (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
            style={tailwind("text-sm font-semibold-v2")}
            testID="dfi_oracle_price"
          >
            {val}
          </ThemedTextV2>
        )}
        thousandSeparator
        value={new BigNumber(price).toFixed(2)}
      />
    </ThemedViewV2>
  );
}

function CopyIcon(): JSX.Element {
  return (
    <ThemedIcon
      iconType="Feather"
      dark={tailwind("text-mono-dark-v2-700")}
      light={tailwind("text-mono-light-v2-700")}
      name="copy"
      size={16}
      style={tailwind("self-center")}
    />
  );
}
