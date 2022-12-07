import { Dispatch, useEffect, useState } from "react";
import { Image } from "react-native";
import { useSelector } from "react-redux";
import { StackScreenProps } from "@react-navigation/stack";
import { EnvironmentNetwork } from "@environment";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { RootState } from "@store";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import { useNetworkContext } from "@shared-contexts/NetworkContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { View } from "@components";
import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { NumberRowV2 } from "@components/NumberRowV2";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import CloseVaultImg from "@assets/images/loans/close_vault.png";
import { LoanParamList } from "../LoansNavigator";

type Props = StackScreenProps<LoanParamList, "CloseVaultScreen">;

export function CloseVaultScreen({ route, navigation }: Props): JSX.Element {
  const { vaultId } = route.params;
  const { tailwind } = useStyles();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);

  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);

  async function onSubmit(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    await closeVault(
      vaultId,
      dispatch,
      () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch);
      },
      () => {},
      logger
    );
  }

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  const truncatedVaultId = `${vaultId.substring(0, 3)}...${vaultId.substring(
    vaultId.length - 3,
    vaultId.length
  )}`;

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("mt-16 h-full justify-between")}
      style={tailwind("px-5")}
    >
      <View style={tailwind("items-center")}>
        <Image
          source={CloseVaultImg}
          style={[
            tailwind("items-center justify-center"),
            { width: 122, height: 95 },
          ]}
          resizeMode="contain"
        />
        <ThemedTextV2
          style={tailwind(
            "mb-1 font-normal-v2 text-base mt-6 mx-7 text-center"
          )}
        >
          {translate(
            "screens/CloseVaultScreen",
            "Are you sure you want to close your vault {{truncatedVaultId}}?",
            {
              truncatedVaultId,
            }
          )}
        </ThemedTextV2>
        <SummaryDetails address={address} addressLabel={addressLabel} />
      </View>

      <View style={tailwind("mb-28 w-full items-center")}>
        <ThemedTextV2
          testID="transaction_details_info_text"
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          style={tailwind("mt-5 text-xs text-center font-normal-v2 mx-16")}
        >
          {translate(
            "screens/CloseVaultScreen",
            "All remaining collaterals will be returned to your wallet."
          )}
        </ThemedTextV2>
        <SubmitButtonGroup
          isDisabled={hasPendingJob || hasPendingBroadcastJob}
          label={translate("screens/CloseVaultScreen", "Close vault")}
          displayCancelBtn={false}
          onSubmit={onSubmit}
          buttonStyle="mt-5 mx-7"
          title="close_vault"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

function SummaryDetails(props: {
  addressLabel: string | null;
  address: string | null;
}): JSX.Element {
  const { tailwind } = useStyles();
  const { network } = useNetworkContext();
  const rowStyle = {
    lhsThemedProps: {
      light: tailwind("text-mono-light-v2-500"),
      dark: tailwind("text-mono-dark-v2-500"),
    },
    rhsThemedProps: {
      light: tailwind("text-mono-light-v2-900"),
      dark: tailwind("text-mono-dark-v2-900"),
    },
  };
  return (
    <ThemedViewV2
      style={tailwind("p-5 border-0.5 mt-6 w-full rounded-lg-v2")}
      dark={tailwind("border-mono-dark-v2-300")}
      light={tailwind("border-mono-light-v2-300")}
    >
      <View style={tailwind("flex flex-row pb-5 items-center justify-between")}>
        <ThemedTextV2>
          <ThemedTextV2
            style={tailwind("text-sm font-normal-v2")}
            light={rowStyle.lhsThemedProps.light}
            dark={rowStyle.lhsThemedProps.dark}
          >
            {translate("screens/CloseVaultScreen", "Wallet")}
          </ThemedTextV2>
        </ThemedTextV2>
        <ThemedViewV2
          dark={tailwind("bg-mono-dark-v2-200")}
          light={tailwind("bg-mono-light-v2-200")}
          style={tailwind(
            "rounded-full pl-1 pr-2.5 py-1 flex flex-row items-center overflow-hidden ml-2"
          )}
        >
          <RandomAvatar name={props.address} size={20} />
          <ThemedTextV2
            ellipsizeMode="middle"
            numberOfLines={1}
            style={[
              tailwind("text-sm font-normal-v2 ml-1", {
                "mx-2": props.addressLabel !== undefined,
                "text-right w-28": props.addressLabel === undefined,
              }),
              {
                minWidth: 10,
                maxWidth: props.addressLabel !== undefined ? 101 : 0,
              },
            ]}
            testID="wallet_address"
          >
            {props.addressLabel ?? props.address}
          </ThemedTextV2>
        </ThemedViewV2>
      </View>
      <NumberRowV2
        containerStyle={{
          style: tailwind("pb-5 flex-row items-start w-full bg-transparent"),
        }}
        lhs={{
          value: translate("screens/CloseVaultScreen", "Fees to return"),
          testID: "fees_to_return_text_lhs",
          themedProps: {
            light: rowStyle.lhsThemedProps.light,
            dark: rowStyle.lhsThemedProps.dark,
          },
        }}
        rhs={{
          value:
            network === EnvironmentNetwork.MainNet ||
            network === EnvironmentNetwork.TestNet
              ? 1
              : 0.5,
          testID: "fees_to_return_text_rhs",
          suffix: " DFI",
          themedProps: {
            light: rowStyle.rhsThemedProps.light,
            dark: rowStyle.rhsThemedProps.dark,
          },
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/CloseVaultScreen", "Fees to burn"),
          testID: "fees_to_burn_text_lhs",
          themedProps: {
            light: rowStyle.lhsThemedProps.light,
            dark: rowStyle.lhsThemedProps.dark,
          },
        }}
        rhs={{
          value:
            network === EnvironmentNetwork.MainNet ||
            network === EnvironmentNetwork.TestNet
              ? 1
              : 0.5,
          testID: "fees_to_burn_text_rhs",
          suffix: " DFI",
          themedProps: {
            light: rowStyle.rhsThemedProps.light,
            dark: rowStyle.rhsThemedProps.dark,
          },
        }}
      />
    </ThemedViewV2>
  );
}

async function closeVault(
  vaultId: string,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  onConfirmation: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const script = await account.getScript();
      const builder = account.withTransactionBuilder();
      const signed = await builder.loans.closeVault(
        {
          vaultId: vaultId,
          to: script,
        },
        script
      );
      return new CTransactionSegWit(signed);
    };

    const truncatedVaultId = `${vaultId.substring(0, 3)}...${vaultId.substring(
      vaultId.length - 3,
      vaultId.length
    )}`;

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/CloseVaultScreen",
          "Closing vault {{vaultId}}",
          {
            vaultId: truncatedVaultId,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing to close vault…"
          ),
          waiting: translate(
            "screens/CloseVaultScreen",
            "Closing vault {{vaultId}}",
            {
              vaultId: truncatedVaultId,
            }
          ),
          complete: translate(
            "screens/CloseVaultScreen",
            "Closed vault {{vaultId}}",
            { vaultId: truncatedVaultId }
          ),
        },
        onBroadcast,
        onConfirmation,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
