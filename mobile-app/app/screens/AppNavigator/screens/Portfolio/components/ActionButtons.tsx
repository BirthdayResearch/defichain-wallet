import {
  IconName,
  IconType,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import {
  DFITokenSelector,
  DFIUtxoSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootState } from "@store";
import { futureSwapSelector } from "@store/futureSwap";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { ScrollView, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useDomainContext, DomainType } from "@contexts/DomainContext";
import { getNativeIcon } from "@components/icons/assets";
import { useThemeContext } from "@waveshq/walletkit-ui";
import BigNumber from "bignumber.js";
import { ConvertIcon } from "@components/icons/assets/ConvertIcon";
import { ConvertDirection } from "@screens/enum";
import { PortfolioParamList } from "../PortfolioNavigator";
import {
  SelectionToken,
  TokenListType,
} from "../../Dex/CompositeSwap/SwapTokenSelectionScreen";
import { useTokenBalance } from "../hooks/TokenBalance";

export interface ActionButtonsProps {
  name: string;
  icon?: IconName;
  iconType?: IconType;
  iconSize?: number;
  onPress: () => void;
  testID: string;
  badge?: string | number;
  isEvmDomain?: boolean;
}

export function ActionButtons(): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext();
  const { domain, isEvmFeatureEnabled } = useDomainContext();
  const isEvmDomain = domain === DomainType.EVM;

  const { dvmTokens, evmTokens } = useTokenBalance();

  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const futureSwaps = useSelector((state: RootState) =>
    futureSwapSelector(state),
  );
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet);
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet),
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet),
  );
  const hasDFIBalance =
    hasFetchedToken &&
    new BigNumber(DFIUtxo.amount ?? 0).plus(DFIToken.amount ?? 0).gt(0);

  const getConvertDirection = (tokenId: string) => {
    if (domain === DomainType.DVM && tokenId === "0") {
      return ConvertDirection.accountToUtxos;
    } else if (domain === DomainType.DVM && tokenId === "0_utxo") {
      return ConvertDirection.utxosToAccount;
    }

    return domain === DomainType.EVM
      ? ConvertDirection.evmToDvm
      : ConvertDirection.dvmToEvm;
  };

  const navigateToTokenSelectionScreen = (listType: TokenListType): void => {
    navigation.navigate("SwapTokenSelectionScreen", {
      fromToken: {
        symbol: undefined,
        displaySymbol: undefined,
      },
      listType: listType,
      list: domain === DomainType.EVM ? evmTokens : dvmTokens,
      onTokenPress: (item) => {
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

        let targetToken: SelectionToken | undefined;
        if (domain === DomainType.DVM && item.tokenId === "0_utxo") {
          // If DFI UTXO -> choose DFI Token
          targetToken = dvmTokens.find((token) => token.tokenId === "0");
        } else if (domain === DomainType.DVM && item.tokenId === "0") {
          // If DFI Token -> no default
          targetToken = undefined;
        } else if (domain === DomainType.EVM) {
          // If EVM -> choose DVM equivalent
          targetToken =
            dvmTokens.find(
              (token) => token.tokenId === item.tokenId.replace("_evm", ""),
            ) ?? defaultTargetToken;
        } else if (domain === DomainType.DVM) {
          // If DVM -> choose EVM equivalent
          targetToken =
            evmTokens.find(
              (token) => token.tokenId === `${item.tokenId}_evm`,
            ) ?? defaultTargetToken;
        }

        navigation.navigate({
          name: "ConvertScreen",
          params: {
            sourceToken: item,
            targetToken,
            convertDirection: getConvertDirection(item.tokenId),
          },
          merge: true,
        });
      },
      isFutureSwap: false,
      isSearchDTokensOnly: false,
    });
  };

  return (
    <View testID="action_button_group">
      <ScrollView
        contentContainerStyle={tailwind(
          "flex justify-between min-w-full px-5 mt-8",
          { "max-w-xs justify-start": isEvmDomain },
        )}
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        {hasDFIBalance && !isEvmDomain && (
          <ActionButton
            name={translate("components/ActionButtons", "Get DFI")}
            iconSize={20}
            testID="get_DFI_action_btn"
            onPress={() => navigation.navigate("GetDFIScreen")}
          />
        )}
        {!isEvmDomain && (
          <ActionButton
            name={translate("components/ActionButtons", "Send")}
            icon="arrow-up-right"
            iconType="Feather"
            iconSize={28}
            testID="send_balance_button"
            onPress={() => {
              navigation.navigate({
                name: "TokenSelectionScreen",
                params: {},
                merge: true,
              });
            }}
          />
        )}
        {isEvmDomain && isEvmFeatureEnabled && (
          <ActionButton
            name={translate("components/ActionButtons", "Convert")}
            iconSize={28}
            testID="convert_action_button"
            onPress={() => {
              navigateToTokenSelectionScreen(TokenListType.From);
            }}
            isEvmDomain
          />
        )}
        <ActionButton
          name={translate("components/ActionButtons", "Receive")}
          icon="arrow-down-left"
          iconType="Feather"
          iconSize={28}
          testID="receive_balance_button"
          onPress={() => navigation.navigate("Receive")}
        />
        {!isEvmDomain && (
          <ActionButton
            name={translate("components/ActionButtons", "Swap")}
            icon="repeat"
            iconType="Feather"
            testID="swap_tokens_button"
            onPress={() =>
              navigation.navigate({
                name: "CompositeSwap",
                params: {},
                merge: true,
              })
            }
          />
        )}
        {!isEvmDomain && isEvmFeatureEnabled && (
          <ActionButton
            name={translate("components/ActionButtons", "Convert")}
            iconSize={28}
            testID="convert_action_button"
            onPress={() => {
              navigateToTokenSelectionScreen(TokenListType.From);
            }}
            isEvmDomain
          />
        )}

        {!isEvmDomain && (
          <>
            {isFeatureAvailable("future_swap") && futureSwaps.length > 0 && (
              <ActionButton
                name={translate("components/ActionButtons", "Future swap")}
                icon="clock"
                iconType="Feather"
                badge={futureSwaps.length > 9 ? "9+" : futureSwaps.length}
                testID="future_swap_button"
                onPress={() => navigation.navigate("FutureSwapScreen")}
              />
            )}

            {isFeatureAvailable("ocg_cfp_dfip") && (
              <ActionButton
                name={translate("components/ActionButtons", "Governance")}
                icon="file"
                iconType="Feather"
                testID="cfp_dfip_button"
                onPress={() => navigation.navigate("OCGProposalsScreen")}
              />
            )}
            <ActionButton
              name={translate("components/ActionButtons", "Transactions")}
              icon="calendar"
              testID="transaction_button"
              iconType="Feather"
              onPress={() => navigation.navigate("TransactionsScreen")}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ActionButton(props: ActionButtonsProps): JSX.Element {
  const DFIIcon = getNativeIcon("DFIlogo");
  const { isLight } = useThemeContext();
  return (
    <View style={tailwind("items-center")}>
      <ThemedTouchableOpacityV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind(
          "rounded-full w-15 h-15 items-center justify-center mx-2.5",
        )}
        onPress={props.onPress}
        testID={props.testID}
      >
        {props.iconType === undefined ? (
          <>
            {props.isEvmDomain ? (
              <ConvertIcon
                color={getColor(
                  isLight ? "mono-light-v2-900" : "mono-dark-v2-900",
                )}
                iconSize={26}
              />
            ) : (
              <DFIIcon
                width={props.iconSize}
                height={props.iconSize}
                color={getColor(
                  isLight ? "mono-light-v2-900" : "mono-dark-v2-900",
                )}
              />
            )}
          </>
        ) : (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            iconType={props.iconType}
            name={props.icon}
            size={props.iconSize ?? 24}
          />
        )}

        {props.badge !== undefined && (
          <View
            style={tailwind(
              "bg-red-v2 rounded-full items-center justify-center h-4 w-4 absolute top-0 right-0",
            )}
          >
            <Text
              style={tailwind("text-2xs font-bold-v2 text-mono-dark-v2-900")}
            >
              {props.badge}
            </Text>
          </View>
        )}
      </ThemedTouchableOpacityV2>
      <ThemedTextV2 style={tailwind("text-xs font-normal-v2 text-center mt-2")}>
        {props.name}
      </ThemedTextV2>
    </View>
  );
}
