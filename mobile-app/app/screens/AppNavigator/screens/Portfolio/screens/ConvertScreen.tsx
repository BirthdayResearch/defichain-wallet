import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import React, { useEffect, useState } from "react";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useSelector } from "react-redux";
import { View } from "@components";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { RootState } from "@store";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { hasTxQueued } from "@store/transaction_queue";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { tokensSelector } from "@store/wallet";
import { getNativeIcon } from "@components/icons/assets";
import { ButtonV2 } from "@components/ButtonV2";
import {
  AmountButtonTypes,
  TransactionCard,
} from "@components/TransactionCard";
import { useToast } from "react-native-toast-notifications";
import { NumericFormat as NumberFormat } from "react-number-format";
import { getNumberFormatValue } from "@api/number-format-value";
import { PortfolioParamList } from "../PortfolioNavigator";
import { TokenListType } from "../../Dex/CompositeSwap/SwapTokenSelectionScreen";
import { useTokenPrice } from "../hooks/TokenPrice";

export type ConversionMode = "utxosToAccount" | "accountToUtxos";
type Props = StackScreenProps<PortfolioParamList, "ConvertScreen">;

interface ConversionIO extends AddressToken {
  unit: ConvertTokenUnit;
}

enum InlineTextStatus {
  Default,
  Warning,
  Error,
}

export enum ConvertTokenUnit {
  UTXO = "UTXO",
  Token = "Token",
}

export function ConvertScreen(props: Props): JSX.Element {
  const { tailwind, getColor } = useStyles();
  const { getTokenPrice } = useTokenPrice();
  const { isLight } = useThemeContext();
  const client = useWhaleApiClient();
  const logger = useLogger();
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const toast = useToast();
  const TOAST_DURATION = 2000;

  // global state
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const [mode, setMode] = useState(props.route.params.mode);
  const [sourceToken, setSourceToken] = useState<ConversionIO>();
  const [targetToken, setTargetToken] = useState<ConversionIO>();
  const [convAmount, setConvAmount] = useState<string>("0");
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const [amount, setAmount] = useState<string>("");
  const [inlineTextStatus, setInlineTextStatus] = useState<InlineTextStatus>(
    InlineTextStatus.Default
  );

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    const [source, target] = getDFIBalances(mode, tokens);
    setSourceToken(source);
    setTargetToken(target);
    const sourceNum = new BigNumber(
      source?.amount !== undefined && source.amount !== "" ? source.amount : 0
    );
    const conversionNum = new BigNumber(amount).isNaN()
      ? new BigNumber(0)
      : new BigNumber(amount);
    const conversion = conversionNum.toString();
    setConvAmount(conversion);
    if (conversionNum.gt(sourceNum)) {
      setInlineTextStatus(InlineTextStatus.Error);
    } else if (
      isUtxoToAccount(mode) &&
      !sourceNum.isZero() &&
      conversionNum.toFixed(8) === sourceNum.toFixed(8)
    ) {
      setInlineTextStatus(InlineTextStatus.Warning);
    } else {
      setInlineTextStatus(InlineTextStatus.Default);
    }
  }, [mode, JSON.stringify(tokens), amount]);

  if (sourceToken === undefined || targetToken === undefined) {
    return <></>;
  }

  function convert(sourceToken: ConversionIO, targetToken: ConversionIO): void {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    navigation.navigate({
      name: "ConvertConfirmationScreen",
      params: {
        sourceUnit: sourceToken.unit,
        sourceBalance: BigNumber.maximum(
          new BigNumber(sourceToken.amount).minus(convAmount),
          0
        ),
        targetUnit: targetToken.unit,
        targetBalance: BigNumber.maximum(
          new BigNumber(targetToken.amount).plus(convAmount),
          0
        ),
        mode,
        amount: new BigNumber(amount),
        fee,
      },
      merge: true,
    });
  }

  function onPercentagePress(amount: string, type: AmountButtonTypes): void {
    setAmount(amount);
    showToast(type);
  }

  function showToast(type: AmountButtonTypes): void {
    if (sourceToken === undefined) {
      return;
    }

    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available {{unit}} entered"
      : "{{percent}} of available {{unit}} entered";
    const toastOption = {
      unit: getDisplayUnit(sourceToken.unit),
      percent: type,
    };
    toast.show(translate("screens/ConvertScreen", toastMessage, toastOption), {
      type: "wallet_toast",
      placement: "top",
      duration: TOAST_DURATION,
    });
  }

  function onTogglePress(): void {
    setMode(isUtxoToAccount(mode) ? "accountToUtxos" : "utxosToAccount");
    setAmount("");
  }

  return (
    <ThemedScrollViewV2 testID="convert_screen">
      <ThemedTextV2
        style={tailwind(
          "mx-10 text-xs font-normal-v2 mt-8 mb-4 tracking-wide-v2 uppercase"
        )}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        testID="source_balance"
      >
        {translate(
          "screens/CompositeSwapScreen",
          "I HAVE {{totalAmount}} {{token}}",
          {
            totalAmount:
              sourceToken != null
                ? BigNumber(sourceToken.amount).toFixed(8)
                : "",
            token: sourceToken != null ? sourceToken.unit : "",
          }
        )}
      </ThemedTextV2>
      <View style={tailwind("mx-5")}>
        <TransactionCard
          maxValue={new BigNumber(sourceToken.amount)}
          onChange={onPercentagePress}
          componentStyle={{
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          }}
          containerStyle={{
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          }}
          amountButtonsStyle={{
            light: tailwind("bg-mono-light-v2-00"),
            dark: tailwind("bg-mono-dark-v2-00"),
            style: tailwind("mt-6 rounded-xl-v2"),
          }}
        >
          <View
            style={tailwind("flex flex-row justify-between items-center pl-5")}
          >
            <View style={tailwind("w-6/12 mr-2")}>
              <ThemedTextInputV2
                style={tailwind("text-xl font-semibold-v2 w-full")}
                light={tailwind("text-mono-light-v2-900")}
                dark={tailwind("text-mono-dark-v2-900")}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={getColor(
                  isLight ? "mono-light-v2-900" : "mono-dark-v2-900"
                )}
                testID="convert_input"
              />
              <NumberFormat
                value={getNumberFormatValue(
                  getTokenPrice(sourceToken.symbol, BigNumber(amount)),
                  2
                )}
                thousandSeparator
                displayType="text"
                prefix="$"
                renderText={(value) => (
                  <ThemedTextV2
                    light={tailwind("text-mono-light-v2-700")}
                    dark={tailwind("text-mono-dark-v2-700")}
                    style={tailwind("text-sm font-normal-v2")}
                  >
                    {value}
                  </ThemedTextV2>
                )}
              />
            </View>
            <FixedTokenButton
              testID={TokenListType.From}
              symbol={sourceToken?.displaySymbol}
              unit={sourceToken.unit}
            />
          </View>
        </TransactionCard>

        <ThemedTextV2
          style={tailwind("font-normal-v2 text-xs mx-5", {
            "mt-2":
              inlineTextStatus === InlineTextStatus.Error ||
              inlineTextStatus === InlineTextStatus.Warning,
          })}
          light={tailwind("text-mono-light-v2-500", {
            "text-red-v2": inlineTextStatus === InlineTextStatus.Error,
            "text-orange-v2": inlineTextStatus === InlineTextStatus.Warning,
          })}
          dark={tailwind("text-mono-dark-v2-500", {
            "text-red-v2": inlineTextStatus === InlineTextStatus.Error,
            "text-orange-v2": inlineTextStatus === InlineTextStatus.Warning,
          })}
          testID="source_balance_label"
        >
          {translate(
            "screens/ConvertScreen",
            inlineTextStatus === InlineTextStatus.Error
              ? "Insufficient balance"
              : inlineTextStatus === InlineTextStatus.Warning
              ? "A small amount of UTXO is reserved for fees"
              : "",
            {
              amount: new BigNumber(sourceToken.amount).toFixed(8),
              unit: getDisplayUnit(sourceToken.unit),
            }
          )}
        </ThemedTextV2>

        <View style={tailwind("my-8 flex-row")}>
          <ThemedViewV2
            dark={tailwind("border-mono-dark-v2-300")}
            light={tailwind("border-mono-light-v2-300")}
            style={tailwind("border-b-0.5 flex-1 h-1/2")}
          />
          <ConvertToggleButton onPress={onTogglePress} />
          <ThemedViewV2
            dark={tailwind("border-mono-dark-v2-300")}
            light={tailwind("border-mono-light-v2-300")}
            style={tailwind("border-b-0.5 flex-1 h-1/2")}
          />
        </View>

        <ThemedTextV2
          style={tailwind("px-5 text-xs font-normal-v2 tracking-wide-v2")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          testID="tokenB_displaySymbol"
        >
          {translate("screens/ConvertScreen", "TO RECEIVE")}
        </ThemedTextV2>

        <View
          style={tailwind(
            "flex flex-row justify-between items-center pl-5 mt-4"
          )}
        >
          <View style={tailwind("w-6/12 mr-2")}>
            <NumberFormat
              value={
                getNumberFormatValue(convAmount, 8) ===
                getNumberFormatValue(0, 8)
                  ? "0.00"
                  : getNumberFormatValue(convAmount, 8)
              }
              thousandSeparator
              displayType="text"
              renderText={(value) => (
                <ThemedTextV2
                  style={tailwind("text-left font-normal-v2 text-xl")}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                >
                  {value}
                </ThemedTextV2>
              )}
            />
            <NumberFormat
              value={getNumberFormatValue(
                getTokenPrice(targetToken.symbol, BigNumber(convAmount)),
                2
              )}
              thousandSeparator
              displayType="text"
              prefix="$"
              renderText={(value) => (
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  style={tailwind("text-sm font-normal-v2")}
                >
                  {value}
                </ThemedTextV2>
              )}
            />
          </View>
          <FixedTokenButton
            testID={TokenListType.To}
            symbol={targetToken?.displaySymbol}
            unit={targetToken.unit}
          />
        </View>

        <View style={tailwind("flex-col w-full")}>
          <ConversionResultCard
            unit={getDisplayUnit(targetToken.unit)}
            oriTargetAmount={targetToken.amount}
            totalTargetAmount={
              amount !== ""
                ? BigNumber.maximum(
                    new BigNumber(targetToken.amount).plus(convAmount),
                    0
                  ).toFixed(8)
                : "-"
            }
          />

          {canConvert(convAmount, sourceToken.amount) && (
            <ThemedTextV2
              style={tailwind("font-normal-v2 text-xs text-center pt-12")}
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
            >
              {`${translate(
                "screens/ConvertScreen",
                "Review full details in the next screen"
              )}`}
            </ThemedTextV2>
          )}
        </View>
      </View>
      <View
        style={tailwind("w-full px-12 pb-10 mt-20", {
          "mt-5": canConvert(convAmount, sourceToken.amount),
        })}
      >
        <ButtonV2
          fillType="fill"
          label={translate("components/Button", "Continue")}
          disabled={
            !canConvert(convAmount, sourceToken.amount) ||
            hasPendingJob ||
            hasPendingBroadcastJob
          }
          styleProps="w-full"
          onPress={() => convert(sourceToken, targetToken)}
          testID="button_continue_convert"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

function getDFIBalances(
  mode: ConversionMode,
  tokens: AddressToken[]
): [source: ConversionIO, target: ConversionIO] {
  const source: AddressToken = isUtxoToAccount(mode)
    ? (tokens.find((tk) => tk.id === "0_utxo") as AddressToken)
    : (tokens.find((tk) => tk.id === "0") as AddressToken);
  const sourceUnit = isUtxoToAccount(mode)
    ? ConvertTokenUnit.UTXO
    : ConvertTokenUnit.Token;

  const target: AddressToken = isUtxoToAccount(mode)
    ? (tokens.find((tk) => tk.id === "0") as AddressToken)
    : (tokens.find((tk) => tk.id === "0_utxo") as AddressToken);
  const targetUnit = isUtxoToAccount(mode)
    ? ConvertTokenUnit.Token
    : ConvertTokenUnit.UTXO;

  return [
    {
      ...source,
      unit: sourceUnit,
      amount: getConvertibleUtxoAmount(mode, source),
    },
    {
      ...target,
      unit: targetUnit,
    },
  ];
}

function ConvertToggleButton(props: { onPress: () => void }): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedTouchableOpacityV2
      style={tailwind("border-0 items-center")}
      onPress={props.onPress}
    >
      <ThemedViewV2
        testID="button_convert_mode_toggle"
        style={tailwind("w-10 h-10 rounded-full items-center justify-center")}
        light={tailwind("bg-mono-light-v2-900")}
        dark={tailwind("bg-mono-dark-v2-900")}
      >
        <ThemedIcon
          iconType="MaterialIcons"
          name="swap-calls"
          size={24}
          light={tailwind("text-mono-light-v2-00")}
          dark={tailwind("text-mono-dark-v2-00")}
        />
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  );
}

function ConversionResultCard(props: {
  unit: string | undefined;
  oriTargetAmount: string;
  totalTargetAmount: string;
}): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      style={tailwind("flex-col w-full p-5 mt-6 rounded-lg-v2 border-0.5")}
      testID="convert_result_card"
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <ThemedViewV2 style={tailwind("flex-row items-center pb-5")}>
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-sm pr-2")}
          testID="convert_available_label"
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {`${translate("screens/ConvertScreen", "Available {{unit}}", {
            unit: props.unit,
          })}`}
        </ThemedTextV2>
        <NumberFormat
          displayType="text"
          renderText={(value) => (
            <ThemedTextV2
              style={tailwind("flex-1 font-normal-v2 text-sm text-right")}
              light={tailwind("text-mono-light-v2-800")}
              dark={tailwind("text-mono-dark-v2-800")}
              testID="convert_available_amount"
            >
              {value}
            </ThemedTextV2>
          )}
          thousandSeparator
          value={new BigNumber(props.oriTargetAmount).toFixed(8)}
        />
      </ThemedViewV2>
      <ThemedViewV2
        style={tailwind("flex-row items-center pt-5 border-t-0.5")}
        light={tailwind("border-mono-light-v2-300")}
        dark={tailwind("border-mono-dark-v2-300")}
      >
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-sm pr-2")}
          testID="convert_resulting_label"
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {`${translate("screens/ConvertScreen", "Resulting {{unit}}", {
            unit: props.unit,
          })}`}
        </ThemedTextV2>
        <NumberFormat
          decimalScale={8}
          displayType="text"
          renderText={(value) => (
            <ThemedTextV2
              style={tailwind("flex-1 font-normal-v2 text-sm text-right")}
              light={tailwind("text-mono-light-v2-800")}
              dark={tailwind("text-mono-dark-v2-800")}
              testID="convert_result_amount"
            >
              {value}
            </ThemedTextV2>
          )}
          thousandSeparator
          value={props.totalTargetAmount}
        />
      </ThemedViewV2>
    </ThemedViewV2>
  );
}

function canConvert(amount: string, balance: string): boolean {
  return (
    new BigNumber(balance).gte(amount) &&
    !new BigNumber(amount).isZero() &&
    new BigNumber(amount).isPositive()
  );
}

function getConvertibleUtxoAmount(
  mode: ConversionMode,
  source: AddressToken
): string {
  if (mode === "accountToUtxos") {
    return source.amount;
  }

  const utxoToReserve = "0.1";
  const leftover = new BigNumber(source.amount).minus(
    new BigNumber(utxoToReserve)
  );
  return leftover.isLessThan(0) ? "0" : leftover.toFixed();
}

function isUtxoToAccount(mode: ConversionMode): boolean {
  return mode === "utxosToAccount";
}

export function getDisplayUnit(unit: ConvertTokenUnit): "UTXO" | "tokens" {
  if (unit === ConvertTokenUnit.Token) {
    return "tokens";
  }
  return unit;
}

function FixedTokenButton(props: {
  symbol: string;
  testID: string;
  unit: string;
}): JSX.Element {
  const { tailwind } = useStyles();
  const Icon = getNativeIcon(props.symbol);
  return (
    <ThemedTouchableOpacityV2
      testID={`token_select_button_${props.testID}`}
      dark={tailwind("bg-mono-dark-v2-00 text-mono-dark-v2-500")}
      light={tailwind("bg-mono-light-v2-00 text-mono-light-v2-500")}
      style={tailwind("flex flex-row rounded-lg-v2 px-3")}
      disabled
    >
      {props.symbol !== undefined && Icon !== undefined && (
        <>
          <View style={tailwind("my-2")}>
            <Icon testID="fixed_token_icon" height={24} width={24} />
          </View>

          <ThemedTextV2
            style={tailwind("ml-2 text-sm font-semibold-v2 my-2.5")}
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            testID={`convert_token_button_${props.testID}_display_symbol`}
          >
            {props.unit}
          </ThemedTextV2>
        </>
      )}
    </ThemedTouchableOpacityV2>
  );
}
