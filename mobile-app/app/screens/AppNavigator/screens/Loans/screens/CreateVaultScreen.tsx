import { View } from "@components";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { Dispatch, useEffect, useState } from "react";
import { LoanScheme } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { useSelector } from "react-redux";
import {
  ascColRatioLoanScheme,
  fetchLoanSchemes,
  fetchVaults,
} from "@store/loans";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { DFIUtxoSelector } from "@store/wallet";
import { queueConvertTransaction } from "@hooks/wallet/Conversion";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { LoanSchemeOptions } from "@screens/AppNavigator/screens/Loans/components/LoanSchemeOptions";
import { ButtonV2 } from "@components/ButtonV2";
import {
  ConversionStatus,
  CreateVaultSummary,
} from "@screens/AppNavigator/screens/Loans/components/CreateVaultSummary";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { LoanParamList } from "../LoansNavigator";

type Props = StackScreenProps<LoanParamList, "CreateVaultScreen">;

export function CreateVaultScreen({ navigation, route }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const { network } = useNetworkContext();
  const { address } = useWalletContext();
  const loanSchemes = useSelector((state: RootState) =>
    ascColRatioLoanScheme(state.loans)
  );
  const hasFetchedLoanSchemes = useSelector(
    (state: RootState) => state.loans.hasFetchedLoanSchemes
  );
  const logger = useLogger();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet)
  );

  const RESERVE_AMOUNT = 2.1;
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const [selectedLoanScheme, setSelectedLoanScheme] = useState<
    LoanScheme | undefined
  >(route.params?.loanScheme);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>(
    new BigNumber(RESERVE_AMOUNT).gt(DFIUtxo.amount)
      ? ConversionStatus.Required
      : ConversionStatus.Not_Required
  );
  const [conversionAmount, setConversionAmount] = useState<
    BigNumber | undefined
  >();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);

  const vaultFee = new BigNumber(
    network === EnvironmentNetwork.MainNet ||
    network === EnvironmentNetwork.TestNet
      ? 2
      : 1
  );

  const onSubmit = async (): Promise<void> => {
    if (
      selectedLoanScheme === undefined ||
      hasPendingJob ||
      hasPendingBroadcastJob
    ) {
      return;
    }

    if (conversionStatus === ConversionStatus.Required) {
      const convertAmount = new BigNumber(RESERVE_AMOUNT).minus(DFIUtxo.amount);
      queueConvertTransaction(
        {
          mode: "accountToUtxos",
          amount: convertAmount,
        },
        dispatch,
        () => {
          setConversionAmount(convertAmount);
          setConversionStatus(ConversionStatus.Processing);
        },
        logger,
        () => {
          setConversionStatus(ConversionStatus.Completed);
        }
      );
    } else {
      if (hasPendingJob || hasPendingBroadcastJob) {
        return;
      }
      await createVault(
        {
          address: address,
          loanScheme: selectedLoanScheme,
        },
        dispatch,
        () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch);
        },
        () => {
          dispatch(
            fetchVaults({
              address,
              client,
            })
          );
        },
        logger
      );
    }
  };

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }));
  }, []);

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    if (
      conversionStatus === ConversionStatus.Processing ||
      conversionStatus === ConversionStatus.Completed
    ) {
      return;
    }

    const needsConvert = new BigNumber(RESERVE_AMOUNT).gt(DFIUtxo.amount);
    setConversionStatus(
      needsConvert ? ConversionStatus.Required : ConversionStatus.Not_Required
    );
    if (needsConvert) {
      setConversionAmount(undefined);
    }
  }, [DFIUtxo]);

  return (
    <ThemedScrollViewV2
      testID="create_vault_screen"
      contentContainerStyle={tailwind("py-8 px-5")}
    >
      <ThemedTextV2
        style={tailwind("text-base font-normal-v2 px-3 text-center")}
      >
        {translate(
          "screens/CreateVaultScreen",
          "Select a loan scheme for your vault."
        )}
      </ThemedTextV2>

      <LoanSchemeOptions
        loanSchemes={loanSchemes}
        isLoading={!hasFetchedLoanSchemes}
        selectedLoanScheme={selectedLoanScheme}
        onLoanSchemePress={(scheme: LoanScheme) =>
          setSelectedLoanScheme(scheme)
        }
      />

      {selectedLoanScheme !== undefined &&
        (conversionStatus !== ConversionStatus.Required ||
          conversionAmount !== undefined) && (
          <CreateVaultSummary
            transactionFee={fee}
            vaultFee={vaultFee}
            convertAmount={conversionAmount}
            conversionStatus={conversionStatus}
          />
        )}

      <ButtonActionMessage
        isConversionRequired={conversionStatus === ConversionStatus.Required}
        hasSelectedLoanScheme={selectedLoanScheme !== undefined}
      />
      <ButtonV2
        disabled={
          selectedLoanScheme === undefined ||
          hasPendingJob ||
          hasPendingBroadcastJob
        }
        label={translate(
          "screens/CreateVaultScreen",
          conversionStatus === ConversionStatus.Required
            ? "Continue"
            : "Create vault"
        )}
        onPress={onSubmit}
        styleProps="mt-0 mx-7"
        testID="create_vault_submit_button"
      />
    </ThemedScrollViewV2>
  );
}

function ButtonActionMessage(props: {
  isConversionRequired: boolean;
  hasSelectedLoanScheme: boolean;
}): JSX.Element {
  return (
    <View style={tailwind("pt-12 px-12")}>
      {props.hasSelectedLoanScheme && (
        <ThemedTextV2
          style={tailwind("text-xs font-normal-v2 pb-5 text-center")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          testID="action_message"
        >
          {translate(
            "screens/CreateVaultScreen",
            props.isConversionRequired
              ? "By continuing, the required amount of DFI will be converted"
              : "Monitor your vault’s collateralization to prevent liquidation."
          )}
        </ThemedTextV2>
      )}
    </View>
  );
}

interface VaultForm {
  loanScheme: LoanScheme;
  address: string;
}

async function createVault(
  { loanScheme }: VaultForm,
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
      const signed = await builder.vault.createVault(
        {
          ownerAddress: script,
          schemeId: loanScheme.id,
        },
        script
      );
      return new CTransactionSegWit(signed);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate("screens/CreateVaultScreen", "Creating vault"),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing to create vault…"
          ),
          waiting: translate("screens/OceanInterface", "Creating vault"),
          complete: translate("screens/OceanInterface", "Vault created"),
        },
        onBroadcast,
        onConfirmation,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
