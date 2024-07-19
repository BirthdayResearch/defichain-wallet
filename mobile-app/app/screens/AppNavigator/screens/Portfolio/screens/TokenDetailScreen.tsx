import * as React from "react";
import { useEffect, useState } from "react";
import { Linking, TouchableOpacity } from "react-native";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { StackScreenProps } from "@react-navigation/stack";
import { translate } from "@translations";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  tokensSelector,
  unifiedDFISelector,
  WalletToken,
} from "@waveshq/walletkit-ui/dist/store";
import {
  getMetaScanTokenUrl,
  useDeFiScanContext,
} from "@shared-contexts/DeFiScanContext";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { View } from "@components";
import {
  IconName,
  IconType,
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { ButtonV2 } from "@components/ButtonV2";
import { InfoTextLinkV2 } from "@components/InfoTextLink";
import { ThemedTouchableListItem } from "@components/themed/ThemedTouchableListItem";
import { ConvertDirection } from "@screens/enum";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { dusdt_converter_token } from "@api/token/dusdt_converter";
import { PortfolioParamList } from "../PortfolioNavigator";
import { useTokenPrice } from "../hooks/TokenPrice";
import { useDenominationCurrency } from "../hooks/PortfolioCurrency";
import { TokenBreakdownDetailsV2 } from "../components/TokenBreakdownDetailsV2";
import { getPrecisedTokenValue } from "../../Auctions/helpers/precision-token-value";
import { PortfolioButtonGroupTabKey } from "../components/TotalPortfolio";
import { TokenIcon } from "../components/TokenIcon";
import { useTokenBalance } from "../hooks/TokenBalance";

interface TokenActionItems {
  title: string;
  icon: IconName;
  onPress: () => void;
  testID: string;
  iconType: IconType;
  isLast?: boolean;
}

type Props = StackScreenProps<PortfolioParamList, "TokenDetailScreen">;

const usePoolPairToken = (
  tokenParam: WalletToken,
): {
  pair?: PoolPairData;
  token: WalletToken;
  swapTokenDisplaySymbol?: string;
} => {
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs);
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );

  // state
  const [token, setToken] = useState(tokenParam);
  const [pair, setPair] = useState<PoolPairData>();
  const [swapTokenDisplaySymbol, setSwapTokenDisplaySymbol] =
    useState<string>();

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id);

    if (t !== undefined) {
      if (t.id === "3") {
        const csUSDTtoken = dusdt_converter_token(token);
        setToken(csUSDTtoken);
      } else {
        setToken(t);
      }
    }

    const poolpair = pairs.find((p) => {
      if (token.isLPS) {
        return p.data.id === token.id;
      }
      // get pair with same id if token passed is not LP
      if (token.id === p.data.tokenA.id) {
        setSwapTokenDisplaySymbol(p.data.tokenB.displaySymbol);
        return true;
      }
      if (token.id === p.data.tokenB.id) {
        setSwapTokenDisplaySymbol(p.data.tokenA.displaySymbol);
        return true;
      }
      return false;
    })?.data;

    if (poolpair !== undefined) {
      setPair(poolpair);
    }
  }, [token, JSON.stringify(tokens), pairs]);

  return {
    pair,
    token,
    swapTokenDisplaySymbol,
  };
};

export function TokenDetailScreen({ route, navigation }: Props): JSX.Element {
  const { denominationCurrency } = useDenominationCurrency();
  const { domain } = useDomainContext();

  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet);
  const { getTokenPrice } = useTokenPrice(denominationCurrency); // input based on selected denomination from portfolio tab
  const DFIUnified = useSelector((state: RootState) =>
    unifiedDFISelector(state.wallet),
  );
  const availableValue = getTokenPrice(
    DFIUnified.symbol,
    new BigNumber(DFIUnified.amount),
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet),
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet),
  );
  const { pair, token, swapTokenDisplaySymbol } = usePoolPairToken(
    route.params.token,
  );

  const { dvmTokens, evmTokens } = useTokenBalance();

  // usdAmount for crypto tokens, undefined for DFI token
  const { usdAmount } = route.params.token;
  const isEvmDomain = domain === DomainType.EVM;
  const onNavigateLiquidity = ({
    destination,
    pair,
    token,
  }: {
    destination: "AddLiquidity" | "RemoveLiquidity";
    pair: PoolPairData;
    token: WalletToken;
  }): void => {
    navigation.navigate("Portfolio", {
      screen: destination,
      initial: false,
      params: {
        pair,
        pairInfo: token,
      },
      merge: true,
    });
  };

  const onNavigateSwap = ({
    pair,
    fromToken,
  }: {
    pair?: PoolPairData;
    fromToken?: WalletToken;
  }): void => {
    navigation.navigate("Portfolio", {
      screen: "CompositeSwap",
      initial: false,
      params: {
        pair,
        fromToken,
        tokenSelectOption: {
          from: {
            isDisabled: false,
            isPreselected: true,
          },
          to: {
            isDisabled: false,
            isPreselected: false,
          },
        },
      },
      merge: true,
    });
  };

  return (
    <ThemedScrollViewV2 contentContainerStyle={tailwind("flex-grow")}>
      <TokenSummary
        token={token}
        border
        usdAmount={usdAmount ?? new BigNumber(0)}
        isEvmDomain={isEvmDomain}
      />

      <View style={tailwind("p-5 pb-12")}>
        {!isEvmDomain && (
          <TokenBreakdownDetailsV2
            hasFetchedToken={hasFetchedToken}
            availableAmount={new BigNumber(DFIUnified.amount)}
            availableValue={availableValue}
            testID="dfi"
            dfiUtxo={DFIUtxo}
            dfiToken={DFIToken}
            token={token}
            usdAmount={usdAmount ?? new BigNumber(0)}
            pair={pair}
          />
        )}
        {token.symbol === "DFI" && token.id !== "0_evm" && (
          <ThemedViewV2
            dark={tailwind("border-mono-dark-v2-300")}
            light={tailwind("border-mono-light-v2-300")}
            style={tailwind("pt-1")}
          >
            <InfoTextLinkV2
              onPress={() =>
                navigation.navigate("Portfolio", {
                  screen: "TokensVsUtxoFaq",
                  merge: true,
                  initial: false,
                })
              }
              text="Learn more about DFI"
              testId="dfi_learn_more"
              textStyle={tailwind("px-0")}
            />
          </ThemedViewV2>
        )}
      </View>

      <View style={tailwind("flex-1 flex-col-reverse pb-12")}>
        <View style={tailwind("px-5")}>
          <ThemedViewV2
            dark={tailwind("bg-mono-dark-v2-00")}
            light={tailwind("bg-mono-light-v2-00")}
            style={tailwind("rounded-lg-v2 px-5")}
          >
            {token.id !== "0" && (
              <>
                {!isEvmDomain && (
                  <TokenActionRow
                    icon="arrow-up-right"
                    iconType="Feather"
                    isLast={false}
                    onPress={() =>
                      navigation.navigate({
                        name: "SendScreen",
                        params: { token },
                        merge: true,
                      })
                    }
                    testID="send_button"
                    title={translate(
                      "screens/TokenDetailScreen",
                      "Send to other wallet",
                    )}
                  />
                )}

                <TokenActionRow
                  icon="arrow-down-left"
                  iconType="Feather"
                  isLast={
                    !(
                      token.symbol === "DFI" ||
                      (token.isLPS && pair !== undefined && !isEvmDomain) ||
                      (pair !== undefined && !token.isLPS && !isEvmDomain)
                    )
                  }
                  onPress={() => navigation.navigate("Receive")}
                  testID="receive_button"
                  title={translate("screens/TokenDetailScreen", "Receive")}
                />
              </>
            )}

            {token.symbol === "DFI" && token.id !== "0_evm" && (
              <TokenActionRow
                icon="swap-calls"
                iconType="MaterialIcons"
                onPress={() => {
                  const convertDirection: ConvertDirection =
                    token.id === "0_utxo"
                      ? ConvertDirection.utxosToAccount
                      : ConvertDirection.accountToUtxos;

                  const utxoToken = dvmTokens.find(
                    (token) => token.tokenId === "0_utxo",
                  );
                  const dfiToken = dvmTokens.find(
                    (token) => token.tokenId === "0",
                  );
                  const [sourceToken, targetToken] =
                    convertDirection === ConvertDirection.utxosToAccount
                      ? [utxoToken, dfiToken]
                      : [dfiToken, utxoToken];

                  navigation.navigate({
                    name: "ConvertScreen",
                    params: {
                      sourceToken,
                      targetToken,
                      convertDirection,
                    },
                    merge: true,
                  });
                }}
                testID="convert_button"
                title={translate(
                  "screens/TokenDetailScreen",
                  "Convert to {{symbol}}",
                  { symbol: "Token/UTXO" },
                )}
              />
            )}

            {token.id === "0_evm" && (
              <TokenActionRow
                icon="swap-calls"
                iconType="MaterialIcons"
                onPress={() => {
                  const convertDirection: ConvertDirection =
                    domain === DomainType.DVM
                      ? ConvertDirection.dvmToEvm
                      : ConvertDirection.evmToDvm;

                  const evmToken = evmTokens.find(
                    (token) => token.tokenId === "0_evm",
                  );
                  const dfiToken = dvmTokens.find(
                    (token) => token.tokenId === "0",
                  );
                  const [sourceToken, targetToken] =
                    convertDirection === ConvertDirection.evmToDvm
                      ? [evmToken, dfiToken]
                      : [dfiToken, evmToken];

                  navigation.navigate({
                    name: "ConvertScreen",
                    params: {
                      sourceToken,
                      targetToken,
                      convertDirection,
                    },
                    merge: true,
                  });
                }}
                testID="convert_button"
                title={translate(
                  "screens/TokenDetailScreen",
                  "Convert to {{symbol}}",
                  { symbol: "Token" },
                )}
              />
            )}
            {token.isLPS && pair !== undefined && (
              <TokenActionRow
                icon="minus-circle"
                iconType="Feather"
                onPress={() =>
                  onNavigateLiquidity({
                    destination: "RemoveLiquidity",
                    pair,
                    token,
                  })
                }
                testID="remove_liquidity_button"
                title={translate(
                  "screens/TokenDetailScreen",
                  "Remove liquidity",
                )}
              />
            )}
            {pair !== undefined && !token.isLPS && !isEvmDomain && (
              <TokenActionRow
                icon="plus-circle"
                iconType="Feather"
                onPress={() =>
                  onNavigateLiquidity({
                    destination: "AddLiquidity",
                    pair,
                    token,
                  })
                }
                testID="add_liquidity_button"
                title={translate("screens/TokenDetailScreen", "Add liquidity")}
              />
            )}
          </ThemedViewV2>

          {/*  Show only for LP tokens */}
          <View style={tailwind("px-5")}>
            {pair !== undefined && token.isLPS && !isEvmDomain && (
              <View style={tailwind("pt-4")}>
                <ButtonV2
                  onPress={() =>
                    onNavigateLiquidity({
                      destination: "AddLiquidity",
                      pair,
                      token,
                    })
                  }
                  testID="add_liquidity_button"
                  label={translate(
                    "screens/TokenDetailScreen",
                    "Add liquidity",
                  )}
                />
              </View>
            )}
          </View>
          {token.symbol === "DFI" && !isEvmDomain && (
            <View style={tailwind("pt-4")}>
              <ButtonV2
                onPress={() =>
                  onNavigateSwap({
                    fromToken: {
                      ...DFIUnified,
                      id: "0_unified",
                    },
                  })
                }
                testID="swap_button_dfi"
                label={translate("screens/TokenDetailScreen", "Swap")}
              />
            </View>
          )}

          {!token.isLPS &&
            pair !== undefined &&
            swapTokenDisplaySymbol !== undefined &&
            !isEvmDomain && (
              <View style={tailwind("pt-4")}>
                <ButtonV2
                  onPress={() => onNavigateSwap({ pair })}
                  testID="swap_button"
                  label={translate("screens/TokenDetailScreen", "Swap")}
                  disabled={!pair.status}
                />
              </View>
            )}
        </View>
      </View>
    </ThemedScrollViewV2>
  );
}

function TokenSummary(props: {
  token: WalletToken;
  border?: boolean;
  usdAmount: BigNumber;
  isEvmDomain?: boolean;
}): JSX.Element {
  const { denominationCurrency } = useDenominationCurrency();
  const { getTokenUrl } = useDeFiScanContext();
  const { network } = useNetworkContext();
  const onTokenUrlPressed = async (): Promise<void> => {
    const id =
      props.token.id === "0_utxo" ||
      props.token.id === "0_unified" ||
      props.token.id === "0_evm"
        ? 0
        : props.token.id;
    const url = props.token.id.includes("_evm")
      ? getMetaScanTokenUrl(network, props.token.id)
      : getTokenUrl(id);
    await Linking.openURL(url);
  };

  return (
    <ThemedViewV2
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      style={tailwind("pt-8 pb-5 mx-5", { "border-b-0.5": props.border })}
    >
      <View style={tailwind("flex-row items-center")}>
        <TokenIcon
          token={{
            isLPS: props.token.isLPS,
            displaySymbol: props.token.displaySymbol,
            id: props.token.id,
          }}
          size={40}
          isEvmToken={props.isEvmDomain}
        />
        <View style={tailwind("flex-col ml-3")}>
          <ThemedTextV2 style={tailwind("font-semibold-v2")}>
            {props.token.displaySymbol}
          </ThemedTextV2>
          <TouchableOpacity
            onPress={onTokenUrlPressed}
            testID="token_detail_explorer_url"
          >
            <View style={tailwind("flex-row")}>
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
                style={tailwind("text-sm font-normal-v2")}
              >
                {props.token.name || props.token.symbol}
              </ThemedTextV2>
              <View style={tailwind("ml-1 flex-grow-0 justify-center")}>
                <ThemedIcon
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  iconType="Feather"
                  name="external-link"
                  size={16}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        {props.token.isLPS ? (
          <></>
        ) : (
          <View style={[tailwind("flex-col"), { marginLeft: "auto" }]}>
            <NumberFormat
              displayType="text"
              renderText={(value) => (
                <ThemedTextV2
                  style={tailwind("flex-wrap font-semibold-v2 text-right")}
                  testID="token_detail_amount"
                >
                  {value}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={new BigNumber(props.token.amount).toFixed(8)}
            />
            <NumberFormat
              displayType="text"
              prefix={
                denominationCurrency === PortfolioButtonGroupTabKey.USDT
                  ? "$"
                  : undefined
              }
              suffix={
                denominationCurrency !== PortfolioButtonGroupTabKey.USDT
                  ? ` ${denominationCurrency}`
                  : undefined
              }
              renderText={(value) => (
                <ThemedTextV2
                  style={tailwind(
                    "flex-wrap text-sm font-normal-v2 text-right",
                  )}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  testID="token_detail_usd_amount"
                >
                  {value}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={getPrecisedTokenValue(props.usdAmount)}
            />
          </View>
        )}
      </View>
    </ThemedViewV2>
  );
}

function TokenActionRow({
  title,
  icon,
  onPress,
  testID,
  iconType,
  isLast,
}: TokenActionItems): JSX.Element {
  return (
    <ThemedTouchableListItem onPress={onPress} isLast={isLast} testID={testID}>
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-900")}
        light={tailwind("text-mono-light-v2-900")}
        style={tailwind("font-normal-v2 text-sm")}
      >
        {title}
      </ThemedTextV2>

      <ThemedIcon
        dark={tailwind("text-mono-dark-v2-700")}
        light={tailwind("text-mono-light-v2-700")}
        iconType={iconType}
        name={icon}
        size={20}
      />
    </ThemedTouchableListItem>
  );
}
