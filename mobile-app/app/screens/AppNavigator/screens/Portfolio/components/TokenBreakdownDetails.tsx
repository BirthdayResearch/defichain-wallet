import { View } from "@components";
import { TextSkeletonLoader } from "@components/TextSkeletonLoader";
import { ThemedProps, ThemedText } from "@components/themed";
import { WalletToken } from "@waveshq/walletkit-ui/dist/store";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { StyleProp, TextProps, ViewProps } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import { getPrecisedTokenValue } from "../../Auctions/helpers/precision-token-value";
import { BalanceText } from "./BalanceText";
import { PortfolioButtonGroupTabKey } from "./TotalPortfolio";

interface TokenBreakdownDetailProps {
  hasFetchedToken: boolean;
  lockedAmount: BigNumber;
  lockedValue: BigNumber;
  availableAmount: BigNumber;
  availableValue: BigNumber;
  dfiUtxo?: WalletToken;
  dfiToken?: WalletToken;
  testID: string;
  denominationCurrency: string;
}

export function TokenBreakdownDetails(
  props: TokenBreakdownDetailProps
): JSX.Element {
  return (
    <>
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_locked`}
        amount={props.lockedAmount.toFixed(8)}
        label="Locked"
        hasFetchedToken={props.hasFetchedToken}
        labelTextStyle={tailwind("font-medium")}
        valueThemeProps={{
          light: tailwind("text-black"),
          dark: tailwind("text-white"),
        }}
      />
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_locked_value`}
        amount={getPrecisedTokenValue(props.lockedValue)}
        label=""
        hasFetchedToken={props.hasFetchedToken}
        valueThemeProps={{
          light: tailwind("text-gray-500"),
          dark: tailwind("text-gray-400"),
        }}
        containerStyle={tailwind("mb-2")}
        prefix={
          props.denominationCurrency === PortfolioButtonGroupTabKey.USDT
            ? "≈ $"
            : undefined
        }
        suffix={
          props.denominationCurrency !== PortfolioButtonGroupTabKey.USDT
            ? ` ${props.denominationCurrency}`
            : undefined
        }
      />
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_available`}
        amount={props.availableAmount.toFixed(8)}
        label="Available"
        hasFetchedToken={props.hasFetchedToken}
        labelTextStyle={tailwind("font-medium")}
        valueThemeProps={{
          light: tailwind("text-black"),
          dark: tailwind("text-white"),
        }}
      />
      <TokenBreakdownDetailsRow
        testID={`${props.testID}_available_value`}
        amount={getPrecisedTokenValue(props.availableValue)}
        label=""
        hasFetchedToken={props.hasFetchedToken}
        valueThemeProps={{
          light: tailwind("text-gray-500"),
          dark: tailwind("text-gray-400"),
        }}
        prefix={
          props.denominationCurrency === PortfolioButtonGroupTabKey.USDT
            ? "≈ $"
            : undefined
        }
        suffix={
          props.denominationCurrency !== PortfolioButtonGroupTabKey.USDT
            ? ` ${props.denominationCurrency}`
            : undefined
        }
      />
      {props.dfiUtxo !== undefined && props.dfiToken !== undefined && (
        <View style={tailwind("mt-4")}>
          <TokenBreakdownDetailsRow
            testID="dfi_utxo"
            amount={new BigNumber(props.dfiUtxo.amount).toFixed(8)}
            label="as UTXO"
            hasFetchedToken={props.hasFetchedToken}
            containerStyle={tailwind("mb-1")}
          />
          <TokenBreakdownDetailsRow
            testID="dfi_token"
            amount={new BigNumber(props.dfiToken.amount).toFixed(8)}
            label="as Token"
            hasFetchedToken={props.hasFetchedToken}
          />
        </View>
      )}
    </>
  );
}

interface TokenBreakdownDetailsRowProps {
  amount: string;
  label: string;
  testID: string;
  hasFetchedToken: boolean;
  labelTextStyle?: StyleProp<TextProps>;
  valueTextStyle?: StyleProp<TextProps>;
  valueThemeProps?: ThemedProps;
  containerStyle?: StyleProp<ViewProps>;
  prefix?: string;
  suffix?: string;
}
function TokenBreakdownDetailsRow({
  amount,
  label,
  testID,
  hasFetchedToken,
  labelTextStyle,
  valueTextStyle,
  valueThemeProps = {
    light: tailwind("text-gray-900"),
    dark: tailwind("text-gray-50"),
  },
  containerStyle,
  prefix,
  suffix,
}: TokenBreakdownDetailsRowProps): JSX.Element {
  return (
    <View style={[tailwind("flex-row flex-1 items-center"), containerStyle]}>
      <ThemedText
        light={tailwind("text-gray-500")}
        dark={tailwind("text-gray-400")}
        style={[tailwind("pr-14 text-xs"), labelTextStyle]}
        testID={`${testID}_label`}
      >
        {translate("components/DFIBalanceCard", label)}
      </ThemedText>
      <View style={tailwind("flex-row flex-1 justify-end")}>
        {hasFetchedToken ? (
          <NumberFormat
            value={amount}
            thousandSeparator
            displayType="text"
            prefix={prefix}
            suffix={suffix}
            renderText={(value) => (
              <BalanceText
                light={valueThemeProps.light}
                dark={valueThemeProps.dark}
                style={[tailwind("text-xs"), valueTextStyle]}
                testID={`${testID}_amount`}
                value={value}
              />
            )}
          />
        ) : (
          <TextSkeletonLoader
            iContentLoaderProps={{
              width: "150",
              height: "14",
              testID: "dfi_breakdown_row_skeleton_loader",
            }}
            textHorizontalOffset="30"
            textWidth="120"
          />
        )}
      </View>
    </View>
  );
}
