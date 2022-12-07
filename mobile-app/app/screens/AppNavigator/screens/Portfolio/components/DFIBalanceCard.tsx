import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  unifiedDFISelector,
} from "@store/wallet";
import { useStyles } from "@tailwind";
import { TouchableOpacity, Text, View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedTouchableOpacityV2 } from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { TextSkeletonLoaderV2 } from "@components/TextSkeletonLoaderV2";
import BigNumber from "bignumber.js";
import { translate } from "@translations";
import { TokenNameText } from "./TokenNameText";
import { TokenAmountText } from "./TokenAmountText";

interface DFIBalaceCardProps {
  denominationCurrency: string;
}

export function DFIBalanceCard({
  denominationCurrency,
}: DFIBalaceCardProps): JSX.Element {
  const { tailwind } = useStyles();
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet)
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet)
  );
  const DFIUnified = useSelector((state: RootState) =>
    unifiedDFISelector(state.wallet)
  );
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet);
  const { getTokenPrice } = useTokenPrice(denominationCurrency); // input based on selected denomination from portfolio tab
  const usdAmount = getTokenPrice(
    DFIUnified.symbol,
    new BigNumber(DFIUnified.amount),
    DFIUnified.isLPS
  );
  const DFIIcon = getNativeIcon("_UTXO");

  return (
    <View style={tailwind("mx-5 mt-2 rounded-lg-v2")} testID="dfi_balance_card">
      <View style={tailwind("flex-col rounded-lg-v2 overflow-hidden")}>
        <ThemedTouchableOpacityV2
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
          style={tailwind("px-5 py-4.5 flex flex-row items-start")}
          onPress={() =>
            navigation.navigate({
              name: "TokenDetailScreen",
              params: { token: DFIUnified, usdAmount },
              merge: true,
            })
          }
          activeOpacity={0.7}
          disabled={
            !new BigNumber(DFIUtxo.amount ?? 0).plus(DFIToken.amount ?? 0).gt(0)
          }
        >
          <View style={tailwind("w-7/12 flex-row items-center")}>
            <DFIIcon width={36} height={36} />
            <TokenNameText
              displaySymbol="DFI"
              name="DeFiChain"
              testID="total_dfi_label"
            />
          </View>
          <View
            style={tailwind("w-5/12 flex-row justify-end", {
              "pt-0.5": Platform.OS === "android",
            })}
          >
            {hasFetchedToken ? (
              <TokenAmountText
                tokenAmount={DFIUnified.amount}
                usdAmount={usdAmount}
                testID="dfi_total_balance"
                denominationCurrency={denominationCurrency}
              />
            ) : (
              <View style={tailwind("flex")}>
                <View style={tailwind("mb-1")}>
                  <TextSkeletonLoaderV2
                    iContentLoaderProps={{
                      width: "150",
                      height: "20",
                      testID: "dfi_balance_skeleton_loader",
                    }}
                    textHorizontalOffset="30"
                    textWidth="120"
                  />
                </View>
                <View>
                  <TextSkeletonLoaderV2
                    iContentLoaderProps={{
                      width: "150",
                      height: "16",
                      testID: "dfi_USD_balance_skeleton_loader",
                    }}
                    textHorizontalOffset="30"
                    textWidth="120"
                  />
                </View>
              </View>
            )}
          </View>
        </ThemedTouchableOpacityV2>
        {hasFetchedToken &&
          !new BigNumber(DFIUtxo.amount ?? 0)
            .plus(DFIToken.amount ?? 0)
            .gt(0) && <GetDFIBtn />}
      </View>
    </View>
  );
}

function GetDFIBtn(): JSX.Element {
  const { tailwind } = useStyles();
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  return (
    <LinearGradient
      start={[0, 0]}
      end={[1, 1]}
      colors={[
        "#FF01AF",
        "#FB01AF",
        "#EF01B1",
        "#DB02B5",
        "#C004BA",
        "#9D06C0",
        "#7208C8",
        "#3F0BD1",
        "#0E0EDB",
      ]}
      locations={[0, 0.13, 0.26, 0.39, 0.52, 0.64, 0.77, 0.89, 1]}
    >
      <TouchableOpacity
        testID="get_DFI_btn"
        // @ts-ignore
        onPress={() => navigation.navigate("GetDFIScreen")}
        activeOpacity={0.7}
      >
        <Text
          style={tailwind(
            "font-semibold-v2 text-sm my-1 text-center text-mono-light-v2-100"
          )}
        >
          {translate("screens/GetDFIScreen", "Get DFI now!")}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
