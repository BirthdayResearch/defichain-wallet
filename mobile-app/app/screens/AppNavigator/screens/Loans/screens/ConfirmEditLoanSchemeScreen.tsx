import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { Dispatch, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { NumberRowV2 } from "@components/NumberRowV2";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { View } from "react-native";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import {
  hasTxQueued,
  hasOceanTXQueued,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { LoanScheme } from "@defichain/whale-api-client/dist/api/loan";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { LoanParamList } from "../LoansNavigator";

type Props = StackScreenProps<LoanParamList, "ConfirmEditLoanSchemeScreen">;

export function ConfirmEditLoanSchemeScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const { vault, loanScheme, fee } = route.params;
  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);

  // Submit
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);

  function onCancel(): void {
    navigation.navigate({
      name: "EditLoanSchemeScreen",
      params: {
        vaultId: vault.vaultId,
      },
      merge: true,
    });
  }
  async function onSubmit(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    await editLoanScheme(
      {
        vaultId: vault.vaultId,
        loanScheme,
      },
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

  return (
    <ThemedScrollViewV2 style={tailwind("px-5 py-8")}>
      <SummaryHeader
        vaultId={vault.vaultId}
        addressLabel={addressLabel}
        address={address}
      />
      <SummaryTransactionDetails
        minColRatio={vault.loanScheme.minColRatio}
        newMinColRatio={loanScheme.minColRatio}
        vaultInterest={vault.loanScheme.interestRate}
        newVaultInterest={loanScheme.interestRate}
        fee={fee}
      />
      <View style={tailwind("my-16")}>
        <SubmitButtonGroup
          isDisabled={
            hasPendingJob ||
            hasPendingBroadcastJob ||
            vault.loanScheme.id === loanScheme.id
          }
          label={translate("screens/ConfirmEditLoanSchemeScreen", "Edit")}
          onCancel={onCancel}
          onSubmit={onSubmit}
          displayCancelBtn
          title="edit_loan_scheme"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

function SummaryHeader(props: {
  vaultId: string;
  addressLabel: string | null;
  address: string | null;
}): JSX.Element {
  return (
    <ThemedViewV2>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("text-xs font-normal-v2")}
        testID="edit_loan_scheme_title"
      >
        {translate(
          "screens/ConfirmEditLoanSchemeScreen",
          "You are editing loan scheme of"
        )}
      </ThemedTextV2>
      <ThemedTextV2
        style={tailwind("text-sm font-normal-v2 mt-1")}
        numberOfLines={1}
        ellipsizeMode="middle"
        testID="edit_loan_scheme_vault_id"
      >
        {props.vaultId}
      </ThemedTextV2>

      <View style={tailwind("flex-row items-center mt-5")}>
        <ThemedTextV2
          style={tailwind("text-xs font-normal-v2")}
          dark={tailwind("text-mono-dark-v2-500")}
          light={tailwind("text-mono-light-v2-500")}
        >
          {translate("screens/common", "on")}
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
              tailwind("text-sm font-normal-v2 ml-1"),
              {
                minWidth: 10,
                maxWidth: 101,
              },
            ]}
            testID="wallet_address"
          >
            {props.addressLabel ?? props.address}
          </ThemedTextV2>
        </ThemedViewV2>
      </View>
    </ThemedViewV2>
  );
}

interface SummaryTransactionDetailsProps {
  minColRatio: string;
  vaultInterest: string;
  newMinColRatio: string;
  newVaultInterest: string;
  fee: BigNumber;
}

function SummaryTransactionDetails(
  props: SummaryTransactionDetailsProps
): JSX.Element {
  return (
    <View style={tailwind("mt-6")}>
      <ThemedViewV2
        dark={tailwind("border-mono-dark-v2-200")}
        light={tailwind("border-mono-light-v2-200")}
        style={tailwind("py-5 border-t-0.5")}
      >
        <NumberRowV2
          lhs={{
            value: translate(
              "screens/ConfirmEditLoanSchemeScreen",
              "Prev. min. collateral ratio"
            ),
            testID: "prev_min_col_ratio_label",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: new BigNumber(props.minColRatio).toFixed(),
            testID: "prev_min_col_ratio",
            suffix: "%",
          }}
        />
        <View style={tailwind("mt-5")}>
          <NumberRowV2
            lhs={{
              value: translate(
                "screens/ConfirmEditLoanSchemeScreen",
                "Prev. interest"
              ),
              testID: "prev_vault_interest_label",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: new BigNumber(props.vaultInterest).toFixed(),
              testID: "prev_vault_interest",
              suffix: "%",
            }}
          />
        </View>
      </ThemedViewV2>
      <ThemedViewV2
        dark={tailwind("border-mono-dark-v2-200")}
        light={tailwind("border-mono-light-v2-200")}
        style={tailwind("py-5 border-t-0.5")}
      >
        <NumberRowV2
          lhs={{
            value: translate(
              "screens/ConfirmEditLoanSchemeScreen",
              "New min. collateral ratio"
            ),
            testID: "new_min_col_ratio_label",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: new BigNumber(props.newMinColRatio).toFixed(),
            testID: "new_min_col_ratio",
            suffix: "%",
          }}
        />
        <View style={tailwind("mt-5")}>
          <NumberRowV2
            lhs={{
              value: translate(
                "screens/ConfirmEditLoanSchemeScreen",
                "New vault interest"
              ),
              testID: "new_vault_interest_label",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: new BigNumber(props.newVaultInterest).toFixed(),
              testID: "new_vault_interest",
              suffix: "%",
            }}
          />
        </View>
      </ThemedViewV2>
      <ThemedViewV2
        dark={tailwind("border-mono-dark-v2-200")}
        light={tailwind("border-mono-light-v2-200")}
        style={tailwind("py-5 border-t-0.5 border-b-0.5")}
      >
        <NumberRowV2
          lhs={{
            value: translate(
              "screens/ConfirmEditLoanSchemeScreen",
              "Transaction fee"
            ),
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
            testID: "estimated_fee_label",
          }}
          rhs={{
            value: new BigNumber(props.fee).toFixed(8),
            themedProps: {
              style: tailwind("font-normal-v2 text-sm"),
            },
            testID: "estimated_fee_amount",
            suffix: " DFI",
          }}
        />
      </ThemedViewV2>
    </View>
  );
}

interface EditForm {
  vaultId: string;
  loanScheme: LoanScheme;
}

async function editLoanScheme(
  { vaultId, loanScheme }: EditForm,
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
      const signed = await builder.loans.updateVault(
        {
          vaultId: vaultId,
          ownerAddress: script,
          schemeId: loanScheme.id,
        },
        script
      );
      return new CTransactionSegWit(signed);
    };

    const truncatedVaultIdFront = `${vaultId.substring(0, 3)}`;
    const truncatedVaultIdBack = `${vaultId.substring(
      vaultId.length - 3,
      vaultId.length
    )}`;

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/OceanInterface",
          "Editing vault {{vaultId}}",
          {
            vaultId: `${truncatedVaultIdFront}...${truncatedVaultIdBack}`,
          }
        ),
        drawerMessages: {
          waiting: translate(
            "screens/OceanInterface",
            "Editing vault {{vaultId}}",
            {
              vaultId: `${truncatedVaultIdFront}...${truncatedVaultIdBack}`,
            }
          ),
          complete: translate(
            "screens/OceanInterface",
            "Edited vault {{vaultId}}",
            {
              vaultId: `${truncatedVaultIdFront}...${truncatedVaultIdBack}`,
            }
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
