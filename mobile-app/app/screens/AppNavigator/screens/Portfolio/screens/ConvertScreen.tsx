import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import React, { useEffect, useState } from "react";
import { useThemeContext } from "@waveshq/walletkit-ui";
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
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  tokensSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { ButtonV2 } from "@components/ButtonV2";
import {
  AmountButtonTypes,
  TransactionCard,
} from "@components/TransactionCard";
import { useToast } from "react-native-toast-notifications";
import { NumericFormat as NumberFormat } from "react-number-format";
import { getNumberFormatValue } from "@api/number-format-value";
import { ConvertDirection } from "@screens/enum";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { getNativeIcon } from "@components/icons/assets";
import { EVMLinearGradient } from "@components/EVMLinearGradient";
import { PortfolioParamList } from "../PortfolioNavigator";
import {
  TokenListType,
  SelectionToken,
} from "../../Dex/CompositeSwap/SwapTokenSelectionScreen";
import { useTokenPrice } from "../hooks/TokenPrice";
import { DomainToken, useTokenBalance } from "../hooks/TokenBalance";

type Props = StackScreenProps<PortfolioParamList, "ConvertScreen">;

enum InlineTextStatus {
  Default,
  Warning,
  Error,
}

export function ConvertScreen(props: Props): JSX.Element {
  const { getTokenPrice } = useTokenPrice();
  const { isLight } = useThemeContext();
  const { domain } = useDomainContext();
  const client = useWhaleApiClient();
  const logger = useLogger();
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );
  const toast = useToast();
  const TOAST_DURATION = 2000;

  // global state
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const [convertDirection, setConvertDirection] = useState(
    props.route.params.convertDirection,
  );
  const [sourceToken, setSourceToken] = useState<DomainToken>(
    props.route.params.sourceToken,
  );
  const [targetToken, setTargetToken] = useState<DomainToken | undefined>(
    props.route.params.targetToken,
  );

  const [convAmount, setConvAmount] = useState<string>("0");
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const [amount, setAmount] = useState<string>("");
  const [inlineTextStatus, setInlineTextStatus] = useState<InlineTextStatus>(
    InlineTextStatus.Default,
  );

  const { dvmTokens, evmTokens } = useTokenBalance();

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    const conversionNum = new BigNumber(amount).isNaN()
      ? new BigNumber(0)
      : new BigNumber(amount);
    const conversion = conversionNum.toString();
    setConvAmount(conversion);

    if (conversionNum.gt(sourceToken.available)) {
      setInlineTextStatus(InlineTextStatus.Error);
    } else if (
      convertDirection === ConvertDirection.utxosToAccount &&
      !sourceToken.available.isZero() &&
      conversionNum.toFixed(8) === sourceToken.available.toFixed(8)
    ) {
      setInlineTextStatus(InlineTextStatus.Warning);
    } else {
      setInlineTextStatus(InlineTextStatus.Default);
    }
  }, [convertDirection, JSON.stringify(tokens), amount]);

  useEffect(() => {
    let updatedConvertDirection: ConvertDirection = convertDirection;

    if (sourceToken.tokenId === "0_utxo" && targetToken?.tokenId === "0") {
      updatedConvertDirection = ConvertDirection.utxosToAccount;
    } else if (
      sourceToken.tokenId === "0" &&
      targetToken?.tokenId === "0_utxo"
    ) {
      updatedConvertDirection = ConvertDirection.accountToUtxos;
    } else if (
      sourceToken.token.domainType === DomainType.DVM &&
      targetToken?.token.domainType === DomainType.EVM
    ) {
      updatedConvertDirection = ConvertDirection.dvmToEvm;
    } else if (
      sourceToken.token.domainType === DomainType.EVM &&
      targetToken?.token.domainType === DomainType.DVM
    ) {
      updatedConvertDirection = ConvertDirection.evmToDvm;
    }

    setConvertDirection(updatedConvertDirection);
  }, [sourceToken, targetToken]);

  if (sourceToken === undefined) {
    return <></>;
  }

  function convert(sourceToken: DomainToken, targetToken?: DomainToken): void {
    if (hasPendingJob || hasPendingBroadcastJob || targetToken === undefined) {
      return;
    }
    navigation.navigate({
      name: "ConvertConfirmationScreen",
      params: {
        amount: new BigNumber(amount),
        convertDirection,
        fee,
        sourceToken: {
          tokenId: sourceToken.tokenId,
          displaySymbol: sourceToken.token.displaySymbol,
          balance: BigNumber.maximum(
            new BigNumber(sourceToken.available).minus(convAmount),
            0,
          ),
          displayTextSymbol: sourceToken.token.displayTextSymbol,
        },
        targetToken: {
          tokenId: targetToken.tokenId,
          displaySymbol: targetToken.token.displaySymbol,
          balance: BigNumber.maximum(
            new BigNumber(targetToken.available).plus(convAmount),
            0,
          ),
          displayTextSymbol: targetToken.token.displayTextSymbol,
        },
      },
      merge: true,
    });
  }

  function onPercentagePress(amount: string, type: AmountButtonTypes): void {
    setAmount(amount);
    showToast(type, domain);
  }

  function showToast(type: AmountButtonTypes, domain: DomainType): void {
    if (sourceToken === undefined) {
      return;
    }

    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available {{unit}} entered"
      : "{{percent}} of available {{unit}} entered";
    const toastOption = {
      unit: translate(
        "screens/ConvertScreen",
        `${sourceToken.token.displayTextSymbol}${
          domain === DomainType.EVM ? " (EVM)" : ""
        }`,
      ),
      percent: type,
    };
    toast.show(translate("screens/ConvertScreen", toastMessage, toastOption), {
      type: "wallet_toast",
      placement: "top",
      duration: TOAST_DURATION,
    });
  }

  function onTogglePress(): void {
    if (!targetToken || !sourceToken) {
      return;
    }
    setSourceToken(targetToken);
    setTargetToken(sourceToken);
    setAmount("");
  }

  function getListByDomain(listType: TokenListType): DomainToken[] {
    if (listType === TokenListType.To) {
      const evmDFIToken = evmTokens.find(({ tokenId }) => tokenId === "0_evm");
      const defaultEvmTargetToken = {
        tokenId: `${sourceToken.tokenId}_evm`,
        available: new BigNumber(evmDFIToken?.available ?? 0),
        token: {
          ...sourceToken.token,
          displaySymbol: "DFI",
          displayTextSymbol: "DFI",
          name: `${sourceToken.token.name} for EVM`,
          domainType: DomainType.EVM,
        },
      };

      // Display UTXO and the source Token
      if (domain === DomainType.DVM && sourceToken.tokenId === "0") {
        return [
          defaultEvmTargetToken,
          ...dvmTokens.filter((token) => token.tokenId === "0_utxo"),
        ];
      } else if (
        // Display DFI (DVM)
        domain === DomainType.DVM &&
        sourceToken.tokenId === "0_utxo"
      ) {
        return dvmTokens.filter((token) => token.tokenId === "0");
      } else if (domain === DomainType.DVM) {
        // Display EVM equivalent
        return [defaultEvmTargetToken];
      } else if (domain === DomainType.EVM && sourceToken.tokenId === "0_evm") {
        // Display DFI (DVM)
        return dvmTokens.filter((token) => token.tokenId === "0");
      }
    }

    return domain === DomainType.DVM ? dvmTokens : evmTokens;
  }

  function onTokenSelect(item: SelectionToken, listType: TokenListType): void {
    let updatedConvertDirection = convertDirection;
    if (
      sourceToken.tokenId === "0" &&
      listType === TokenListType.To &&
      item.tokenId === "0_utxo"
    ) {
      // If from:DFI-DVM -> to: accountToUtxos
      updatedConvertDirection = ConvertDirection.accountToUtxos;
    } else if (
      sourceToken.tokenId === "0_utxo" &&
      listType === TokenListType.To &&
      item.tokenId === "0"
    ) {
      // If from:DFI-UTXO -> to: utxosToAccount
      updatedConvertDirection = ConvertDirection.utxosToAccount;
    } else if (
      sourceToken.tokenId === "0" &&
      listType === TokenListType.To &&
      item.tokenId === "0_evm"
    ) {
      updatedConvertDirection = ConvertDirection.dvmToEvm;
    }

    let updatedTargetToken: SelectionToken | undefined;
    const defaultTargetToken = {
      tokenId:
        domain === DomainType.DVM
          ? `${item.tokenId}_evm`
          : item.tokenId.replace("_evm", ""),
      available: new BigNumber(0),
      token: {
        ...item.token,
        name:
          domain === DomainType.DVM
            ? `${item.token.name} for EVM`
            : item.token.name,
        domainType: DomainType.EVM,
      },
    };

    if (listType === TokenListType.From) {
      /* Move to a hook since it's used in portfolio page and convert screen */
      if (domain === DomainType.DVM && item.tokenId === "0_utxo") {
        // If DFI UTXO -> choose DFI Token
        updatedTargetToken =
          dvmTokens.find((token) => token.tokenId === "0") ??
          defaultTargetToken;
      } else if (domain === DomainType.DVM && item.tokenId === "0") {
        // If DFI Token -> no default
        updatedTargetToken = undefined;
      } else if (domain === DomainType.EVM) {
        // If EVM -> choose DVM equivalent
        updatedTargetToken =
          dvmTokens.find(
            (token) => token.tokenId === item.tokenId.replace("_evm", ""),
          ) ?? defaultTargetToken;
      } else if (domain === DomainType.DVM) {
        // If DVM -> choose EVM equivalent
        updatedTargetToken =
          evmTokens.find((token) => token.tokenId === `${item.tokenId}_evm`) ??
          defaultTargetToken;
      }
      /* End of what will be moved into a hook */
    } else {
      updatedTargetToken = item;
    }

    navigation.navigate({
      name: "ConvertScreen",
      params: {
        sourceToken: listType === TokenListType.From ? item : sourceToken,
        targetToken: updatedTargetToken,
        convertDirection: updatedConvertDirection,
      },
      key: updatedTargetToken?.tokenId,
      merge: true,
    });
  }

  function navigateToTokenSelectionScreen(listType: TokenListType): void {
    navigation.navigate("SwapTokenSelectionScreen", {
      fromToken: {
        symbol: sourceToken.token.symbol,
        displaySymbol: sourceToken.token.displaySymbol,
      },
      listType: listType,
      list: getListByDomain(listType),
      onTokenPress: (item) => {
        onTokenSelect(item, listType);
      },
      isFutureSwap: false,
      isConvert: true,
      isSearchDTokensOnly: false,
    });
  }

  return (
    <ThemedScrollViewV2 testID="convert_screen">
      <ThemedTextV2
        style={tailwind(
          "mx-10 text-xs font-normal-v2 mt-8 mb-4 tracking-wide-v2",
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
                ? BigNumber(sourceToken.available).toFixed(8)
                : "",
            token:
              convertDirection === ConvertDirection.evmToDvm
                ? `${sourceToken.token.displayTextSymbol} (EVM)`
                : sourceToken.token.displayTextSymbol,
          },
        )}
      </ThemedTextV2>
      <View style={tailwind("mx-5")}>
        <TransactionCard
          maxValue={sourceToken.available}
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
                  isLight ? "mono-light-v2-900" : "mono-dark-v2-900",
                )}
                testID="convert_input"
              />
              <NumberFormat
                value={getNumberFormatValue(
                  getTokenPrice(sourceToken.token.symbol, BigNumber(amount)),
                  2,
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

            <TokenDropdownButton
              tokenId={sourceToken.tokenId}
              isEvmToken={sourceToken?.token.domainType === DomainType.EVM}
              symbol={sourceToken.token.displaySymbol}
              displayedTextSymbol={sourceToken.token.displayTextSymbol}
              testID={TokenListType.From}
              onPress={() => {
                navigateToTokenSelectionScreen(TokenListType.From);
              }}
              status={TokenDropdownButtonStatus.Enabled}
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
              amount: new BigNumber(sourceToken.available).toFixed(8),
              unit: sourceToken.token.displaySymbol,
            },
          )}
        </ThemedTextV2>

        <View style={tailwind("my-8 flex-row")}>
          <ThemedViewV2
            dark={tailwind("border-mono-dark-v2-300")}
            light={tailwind("border-mono-light-v2-300")}
            style={tailwind("border-b-0.5 flex-1 h-1/2")}
          />
          <ConvertToggleButton
            onPress={onTogglePress}
            isDisabled={!sourceToken || !targetToken}
          />
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
          {translate("screens/ConvertScreen", "TO CONVERT")}
        </ThemedTextV2>

        <View
          style={tailwind(
            "flex flex-row justify-between items-center pl-5 mt-4",
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
                targetToken === undefined
                  ? 0
                  : getTokenPrice(
                      targetToken.token.symbol,
                      BigNumber(convAmount),
                    ),
                2,
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

          {sourceToken.tokenId === "0" && (
            <TokenDropdownButton
              tokenId={targetToken?.tokenId}
              isEvmToken={targetToken?.token.domainType === DomainType.EVM}
              symbol={targetToken?.token.displaySymbol}
              displayedTextSymbol={targetToken?.token.displayTextSymbol}
              testID={TokenListType.To}
              onPress={() => {
                navigateToTokenSelectionScreen(TokenListType.To);
              }}
              status={TokenDropdownButtonStatus.Enabled}
            />
          )}
          {sourceToken.tokenId !== "0" && targetToken && (
            <FixedTokenButton
              testID={TokenListType.To}
              symbol={targetToken.token.displaySymbol}
              unit={targetToken.token.displayTextSymbol}
              isEvmToken={targetToken?.token.domainType === DomainType.EVM}
            />
          )}
        </View>

        {targetToken !== undefined && (
          <View style={tailwind("flex-col w-full")}>
            <ConversionResultCard
              unit={`${targetToken.token.displayTextSymbol}${
                convertDirection === ConvertDirection.dvmToEvm ? " (EVM)" : ""
              }`}
              oriTargetAmount={targetToken.available}
              totalTargetAmount={
                amount !== ""
                  ? BigNumber.maximum(
                      targetToken.available.plus(convAmount),
                      0,
                    ).toFixed(8)
                  : "-"
              }
            />
            {canConvert(convAmount, sourceToken.available) && (
              <ThemedTextV2
                style={tailwind("font-normal-v2 text-xs text-center pt-12")}
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-dark-v2-500")}
              >
                {translate(
                  "screens/ConvertScreen",
                  "Review full details in the next screen",
                )}
              </ThemedTextV2>
            )}
          </View>
        )}
      </View>
      <View
        style={tailwind("w-full px-12 pb-10 mt-20", {
          "mt-5": canConvert(convAmount, sourceToken.available),
        })}
      >
        <ButtonV2
          fillType="fill"
          label={translate("components/Button", "Continue")}
          disabled={
            !canConvert(convAmount, sourceToken.available) ||
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

function ConvertToggleButton(props: {
  isDisabled: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={tailwind("border-0 items-center")}
      onPress={props.onPress}
      disabled={props.isDisabled}
    >
      <ThemedViewV2
        testID="button_convert_mode_toggle"
        style={tailwind("w-10 h-10 rounded-full items-center justify-center", {
          "opacity-30": props.isDisabled,
        })}
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
  unit: string;
  oriTargetAmount: BigNumber;
  totalTargetAmount: string;
}): JSX.Element {
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
          {translate("screens/ConvertScreen", "Available {{unit}}", {
            unit: translate("screens/ConvertScreen", props.unit),
          })}
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
          {translate("screens/ConvertScreen", "Resulting {{unit}}", {
            unit: translate("screens/ConvertScreen", props.unit),
          })}
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

function canConvert(amount: string, balance: BigNumber): boolean {
  return (
    new BigNumber(balance).gte(amount) &&
    !new BigNumber(amount).isZero() &&
    new BigNumber(amount).isPositive()
  );
}

function FixedTokenButton(props: {
  symbol: string;
  testID: string;
  unit: string;
  isEvmToken?: boolean;
}): JSX.Element {
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
        <View style={tailwind("flex flex-row items-center")}>
          <EVMLinearGradient isEvmToken={props.isEvmToken}>
            <Icon testID="fixed_token_icon" height={24} width={24} />
          </EVMLinearGradient>
          <ThemedTextV2
            style={tailwind("ml-2 text-sm font-semibold-v2 my-2.5")}
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            testID={`convert_token_button_${props.testID}_display_symbol`}
          >
            {props.unit}
          </ThemedTextV2>
        </View>
      )}
    </ThemedTouchableOpacityV2>
  );
}
