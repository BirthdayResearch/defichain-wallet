import { View } from "@components";
import { TextSkeletonLoader } from "@components/TextSkeletonLoader";
import { ThemedProps, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { RootState } from "@store";
import { WalletToken } from "@waveshq/walletkit-ui/dist/store";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { StyleProp, TextProps, ViewStyle } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import { useSelector } from "react-redux";
import { getPrecisedCurrencyValue } from "../../Auctions/helpers/precision-token-value";
import { useDenominationCurrency } from "../hooks/PortfolioCurrency";
import {
  LockedBalance,
  useTokenLockedBalance,
} from "../hooks/TokenLockedBalance";
import { useTokenPrice } from "../hooks/TokenPrice";
import { PortfolioButtonGroupTabKey } from "./TotalPortfolio";

interface TokenBreakdownDetailProps {
  hasFetchedToken: boolean;
  availableAmount: BigNumber;
  availableValue: BigNumber;
  dfiUtxo?: WalletToken;
  dfiToken?: WalletToken;
  testID: string;
  token: WalletToken;
  usdAmount: BigNumber;
  pair?: PoolPairData;
}

export function TokenBreakdownDetailsV2(
  props: TokenBreakdownDetailProps,
): JSX.Element {
  const { denominationCurrency } = useDenominationCurrency();
  const lockedToken = (useTokenLockedBalance({
    displaySymbol: props.token.displaySymbol,
    denominationCurrency,
  }) as LockedBalance) ?? {
    amount: new BigNumber(0),
    tokenValue: new BigNumber(0),
  };
  const loanTokens = useSelector((state: RootState) => state.loans.loanTokens);
  const collateralTokens = useSelector(
    (state: RootState) => state.loans.collateralTokens,
  );
  const hasLockedBalance = useMemo((): boolean => {
    return (
      collateralTokens.some(
        (collateralToken) =>
          collateralToken.token.displaySymbol === props.token.displaySymbol,
      ) ||
      loanTokens.some(
        (loanToken) =>
          loanToken.token.displaySymbol === props.token.displaySymbol,
      )
    );
  }, [props.token]);
  const { getTokenPrice } = useTokenPrice(denominationCurrency);

  // LP token calculations
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet);
  const poolPairData = pairs.find(
    (pr) => pr.data.symbol === (props.token as AddressToken).symbol,
  );
  const mappedPair = poolPairData?.data;
  const toRemove = new BigNumber(1)
    .times(props.token.amount)
    .decimalPlaces(8, BigNumber.ROUND_DOWN);
  const ratioToTotal = toRemove.div(mappedPair?.totalLiquidity?.token ?? 1);
  const tokenATotal = ratioToTotal
    .times(mappedPair?.tokenA.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN);
  const tokenBTotal = ratioToTotal
    .times(mappedPair?.tokenB.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN);
  const getUSDValue = (
    amount: BigNumber,
    symbol: string,
    isLPs: boolean = false,
  ): BigNumber => {
    return getTokenPrice(symbol, amount, isLPs);
  };
  const isUSDDenomination =
    denominationCurrency === PortfolioButtonGroupTabKey.USDT;

  return (
    <ThemedViewV2
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      {/* To display options for locked in collateral/vault and available amount */}
      {hasLockedBalance && !lockedToken.amount.isZero() && (
        <View style={tailwind("pb-4")}>
          <TokenBreakdownDetailsRow
            testID={`${props.token.symbol}_locked`}
            amount={lockedToken.amount.toFixed(8)}
            label="Locked in vault(s)"
            hasFetchedToken={props.hasFetchedToken}
            valueThemeProps={{
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            }}
            suffix={` ${props.token.displaySymbol}`}
          />
          <TokenBreakdownDetailsRow
            testID={`${props.token.symbol}_locked_value`}
            amount={getPrecisedCurrencyValue(lockedToken.tokenValue)}
            label=""
            hasFetchedToken={props.hasFetchedToken}
            valueThemeProps={{
              light: tailwind("text-mono-light-v2-700"),
              dark: tailwind("text-mono-dark-v2-700"),
            }}
            containerStyle={tailwind("mb-5")}
            prefix={isUSDDenomination ? "$" : undefined}
            suffix={!isUSDDenomination ? ` ${denominationCurrency}` : undefined}
          />
          <TokenBreakdownDetailsRow
            testID={`${props.token.symbol}_available`}
            amount={new BigNumber(props.token.amount).toFixed(8)}
            label="Available"
            hasFetchedToken={props.hasFetchedToken}
            suffix={` ${props.token.displaySymbol}`}
          />

          {/* Available amount in USD based on DFI or other crypto */}
          {props.token.symbol === "DFI" ? (
            <TokenBreakdownDetailsRow
              testID={`${props.testID}_${props.token.symbol}_available_value`}
              amount={getPrecisedCurrencyValue(props.availableValue)}
              label=""
              hasFetchedToken={props.hasFetchedToken}
              valueThemeProps={{
                light: tailwind("text-mono-light-v2-700"),
                dark: tailwind("text-mono-dark-v2-700"),
              }}
              prefix={isUSDDenomination ? "$" : undefined}
              suffix={
                !isUSDDenomination ? ` ${denominationCurrency}` : undefined
              }
            />
          ) : (
            <TokenBreakdownDetailsRow
              testID={`${props.testID}_${props.token.symbol}_available_value`}
              amount={getPrecisedCurrencyValue(props.usdAmount)}
              label=""
              hasFetchedToken={props.hasFetchedToken}
              valueThemeProps={{
                light: tailwind("text-mono-light-v2-700"),
                dark: tailwind("text-mono-dark-v2-700"),
              }}
              prefix={isUSDDenomination ? "$" : undefined}
              suffix={
                !isUSDDenomination ? ` ${denominationCurrency}` : undefined
              }
              border
            />
          )}
        </View>
      )}

      {/* To display options for DFI UTXO and Token */}
      {props.token.displaySymbol === "DFI" &&
        props.token.id !== "0_evm" &&
        props.dfiUtxo !== undefined &&
        props.dfiToken !== undefined && (
          <View style={tailwind("pb-4")}>
            <DFITokenBreakDownDetailsRow
              testID="dfi_utxo"
              amount={new BigNumber(props.dfiUtxo.amount).toFixed(8)}
              label="As UTXO"
              hasFetchedToken={props.hasFetchedToken}
              containerStyle={tailwind("mb-1")}
              percentageValue={new BigNumber(props.dfiUtxo.amount)
                .div(props.availableAmount)
                .multipliedBy(100)}
              suffix={` ${props.token.displaySymbol}`}
            />

            <DFITokenBreakDownDetailsRow
              testID="dfi_token"
              amount={new BigNumber(props.dfiToken.amount).toFixed(8)}
              label="As Token"
              hasFetchedToken={props.hasFetchedToken}
              percentageValue={new BigNumber(props.dfiToken.amount)
                .div(props.availableAmount)
                .multipliedBy(100)}
              border
              suffix={` ${props.token.displaySymbol}`}
            />
          </View>
        )}

      {/* To display options for liquidity pooled tokens */}
      {props.token.isLPS && props.pair !== undefined && (
        <>
          <View style={tailwind("pb-4")}>
            <TokenBreakdownDetailsRow
              testID={`your_lp_pool_${props.pair.symbol}`}
              amount={props.token.amount}
              label={translate("components/DFIBalanceCard", "Your LP tokens")}
              hasFetchedToken={props.hasFetchedToken}
            />
            <TokenBreakdownDetailsRow
              testID={`your_lp_pool_${props.pair.symbol}_usd`}
              amount={getPrecisedCurrencyValue(
                getTokenPrice(
                  props.token.symbol,
                  new BigNumber(props.token.amount),
                  true,
                ),
              )}
              label=""
              hasFetchedToken={props.hasFetchedToken}
              valueThemeProps={{
                light: tailwind("text-mono-light-v2-700"),
                dark: tailwind("text-mono-dark-v2-700"),
              }}
              prefix={isUSDDenomination ? "$" : undefined}
              suffix={
                !isUSDDenomination ? ` ${denominationCurrency}` : undefined
              }
            />
          </View>
          <View style={tailwind("pb-4")}>
            <TokenBreakdownDetailsRow
              testID={`tokens_in_${props.pair.symbol}_${props.pair.tokenA.displaySymbol}`}
              amount={tokenATotal.toFixed(8)}
              label={translate(
                "components/DFIBalanceCard",
                "Tokens in {{token}}",
                { token: props.pair.tokenA.displaySymbol },
              )}
              hasFetchedToken={props.hasFetchedToken}
            />
            <TokenBreakdownDetailsRow
              testID={`tokens_in_${props.pair.symbol}_${props.pair.tokenA.displaySymbol}_usd`}
              amount={getPrecisedCurrencyValue(
                getUSDValue(
                  new BigNumber(tokenATotal),
                  props.pair.tokenA.symbol,
                ),
              )}
              label=""
              hasFetchedToken={props.hasFetchedToken}
              valueThemeProps={{
                light: tailwind("text-mono-light-v2-700"),
                dark: tailwind("text-mono-dark-v2-700"),
              }}
              prefix={isUSDDenomination ? "$" : undefined}
              suffix={
                !isUSDDenomination ? ` ${denominationCurrency}` : undefined
              }
            />
          </View>
          <TokenBreakdownDetailsRow
            testID={`tokens_in_${props.pair.symbol}_${props.pair.tokenB.displaySymbol}`}
            amount={tokenBTotal.toFixed(8)}
            label={translate(
              "components/DFIBalanceCard",
              "Tokens in {{token}}",
              { token: props.pair.tokenB.displaySymbol },
            )}
            hasFetchedToken={props.hasFetchedToken}
          />
          <TokenBreakdownDetailsRow
            testID={`tokens_in_${props.pair.symbol}_${props.pair.tokenB.displaySymbol}_usd`}
            amount={getPrecisedCurrencyValue(
              getUSDValue(new BigNumber(tokenBTotal), props.pair.tokenB.symbol),
            )}
            label=""
            hasFetchedToken={props.hasFetchedToken}
            valueThemeProps={{
              light: tailwind("text-mono-light-v2-700"),
              dark: tailwind("text-mono-dark-v2-700"),
            }}
            prefix={isUSDDenomination ? "$" : undefined}
            suffix={!isUSDDenomination ? ` ${denominationCurrency}` : undefined}
            border
          />
        </>
      )}
    </ThemedViewV2>
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
  containerStyle?: StyleProp<ViewStyle>;
  prefix?: string;
  suffix?: string;
  border?: boolean;
}

interface DFITokenBreakdownRowProps extends TokenBreakdownDetailsRowProps {
  percentageValue: BigNumber;
}

function DFITokenBreakDownDetailsRow({
  amount,
  label,
  testID,
  hasFetchedToken,
  labelTextStyle,
  valueTextStyle,
  valueThemeProps = {
    light: tailwind("text-mono-light-v2-900"),
    dark: tailwind("text-mono-dark-v2-900"),
  },
  containerStyle,
  prefix,
  suffix,
  percentageValue,
  border,
}: DFITokenBreakdownRowProps): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      style={[
        tailwind("flex-row pb-0.5", { "border-b-0.5 pb-5": border }),
        containerStyle,
      ]}
    >
      <ThemedTextV2
        style={[tailwind("text-xs font-normal-v2"), labelTextStyle]}
        testID={`${testID}_label`}
      >
        {translate("components/DFIBalanceCard", label)}
      </ThemedTextV2>

      {/* To display initial 0.00% */}
      {hasFetchedToken ? (
        <NumberFormat
          value={
            percentageValue.isNaN()
              ? new BigNumber("0").toFixed(2)
              : percentageValue.toFixed(2)
          }
          displayType="text"
          renderText={(value) => (
            <ThemedTextV2
              style={tailwind("text-xs font-normal-v2 pr-1")}
              testID={`${testID}_percentage`}
            >
              {value}
            </ThemedTextV2>
          )}
          thousandSeparator
          prefix=" ("
          suffix="%)"
          valueIsNumericString
        />
      ) : (
        <TextSkeletonLoader
          iContentLoaderProps={{
            width: "60",
            height: "14",
            testID: `${testID}_percentage_breakdown_row_skeleton_loader`,
          }}
          textHorizontalOffset="30"
          textWidth="120"
        />
      )}

      <View style={tailwind("flex-row flex-1 justify-end")}>
        {hasFetchedToken ? (
          <NumberFormat
            value={amount}
            thousandSeparator
            displayType="text"
            prefix={prefix}
            suffix={suffix}
            renderText={(value) => (
              <ThemedTextV2
                light={valueThemeProps.light}
                dark={valueThemeProps.dark}
                style={[tailwind("text-xs font-normal-v2"), valueTextStyle]}
                testID={`${testID}_amount`}
              >
                {value}
              </ThemedTextV2>
            )}
          />
        ) : (
          <TextSkeletonLoader
            iContentLoaderProps={{
              width: "150",
              height: "14",
              testID: `${testID}_breakdown_row_skeleton_loader`,
            }}
            textHorizontalOffset="30"
            textWidth="120"
          />
        )}
      </View>
    </ThemedViewV2>
  );
}

function TokenBreakdownDetailsRow({
  amount,
  label,
  testID,
  hasFetchedToken,
  labelTextStyle,
  valueTextStyle,
  valueThemeProps = {
    light: tailwind("text-mono-light-v2-900"),
    dark: tailwind("text-mono-dark-v2-900"),
  },
  containerStyle,
  prefix,
  suffix,
  border,
}: TokenBreakdownDetailsRowProps): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      style={[
        tailwind("flex-row pb-1", { "border-b-0.5 pb-5 ": border }),
        containerStyle,
      ]}
    >
      <ThemedTextV2
        style={[tailwind("text-xs font-normal-v2"), labelTextStyle]}
        testID={`${testID}_label`}
      >
        {translate("components/DFIBalanceCard", label)}
      </ThemedTextV2>

      <View style={tailwind("flex-row flex-1 justify-end")}>
        {hasFetchedToken ? (
          <NumberFormat
            value={amount}
            thousandSeparator
            displayType="text"
            prefix={prefix}
            suffix={suffix}
            renderText={(value) => (
              <ThemedTextV2
                light={valueThemeProps.light}
                dark={valueThemeProps.dark}
                style={[tailwind("text-xs font-normal-v2"), valueTextStyle]}
                testID={`${testID}_amount`}
              >
                {value}
              </ThemedTextV2>
            )}
          />
        ) : (
          <TextSkeletonLoader
            iContentLoaderProps={{
              width: "150",
              height: "14",
              testID: `${testID}_breakdown_row_skeleton_loader`,
            }}
            textHorizontalOffset="30"
            textWidth="120"
          />
        )}
      </View>
    </ThemedViewV2>
  );
}
