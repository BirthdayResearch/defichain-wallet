import { ThemedScrollViewV2 } from "@components/themed";
import BigNumber from "bignumber.js";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { Dispatch, useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import {
  firstTransactionSelector,
  hasTxQueued as hasBroadcastQueued,
} from "@store/ocean";
import { TokenData } from "@defichain/whale-api-client/dist/api/tokens";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import {
  getCollateralFactor,
  getCollateralValue,
} from "@screens/AppNavigator/screens/Loans/hooks/CollateralPrice";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { fetchVaults } from "@store/loans";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitleV2 } from "@components/SummaryTitleV2";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { AddressType } from "@store/wallet";
import { TextRowV2 } from "@components/TextRowV2";
import { SubmitButtonGroupV2 } from "@components/SubmitButtonGroupV2";
import { WalletAlert } from "@components/WalletAlert";
import { LoanParamList } from "../LoansNavigator";
import { CollateralRatioRow } from "./AddOrRemoveCollateralScreen";

type Props = StackScreenProps<LoanParamList, "ConfirmEditCollateralScreen">;

export function ConfirmEditCollateralScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const {
    vault,
    token,
    amount,
    fee,
    isAdd,
    collateralItem,
    resultingColRatio,
    collateralizationColor,
    vaultShare,
    conversion,
  } = route.params;
  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);
  const client = useWhaleApiClient();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const currentBroadcastJob = useSelector((state: RootState) =>
    firstTransactionSelector(state.ocean)
  );

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const logger = useLogger();

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  useEffect(() => {
    if (conversion?.isConversionRequired) {
      if (
        hasPendingBroadcastJob &&
        currentBroadcastJob !== undefined &&
        currentBroadcastJob.submitButtonLabel !== undefined
      ) {
        setIsConverting(true);
      } else {
        setIsConverting(false);
      }
    }
  }, [hasPendingBroadcastJob, currentBroadcastJob]);

  function onCancel(): void {
    WalletAlert({
      title: translate("screens/Settings", "Cancel transaction"),
      message: translate(
        "screens/Settings",
        "By cancelling, you will lose any changes you made for your transaction."
      ),
      buttons: [
        {
          text: translate("screens/Settings", "Go back"),
          style: "default",
        },
        {
          text: translate("screens/Settings", "Cancel"),
          style: "destructive",
          onPress: async () => {
            navigation.navigate({
              name: "EditCollateralScreen",
              params: {
                vaultId: vault.vaultId,
              },
            });
          },
        },
      ],
    });
  }

  async function onSubmit(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    await modifyCollateral(
      {
        vaultId: vault.vaultId,
        token,
        tokenAmount: amount,
        isAdd,
      },
      dispatch,
      logger,
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
      }
    );
  }

  const containerThemeOptions = {
    light: tailwind("bg-transparent border-mono-light-v2-300"),
    dark: tailwind("bg-transparent border-mono-dark-v2-300"),
  };
  const lhsThemedProps = {
    light: tailwind("text-mono-light-v2-500"),
    dark: tailwind("text-mono-dark-v2-500"),
  };
  const rhsThemedProps = {
    light: tailwind("text-mono-light-v2-900"),
    dark: tailwind("text-mono-dark-v2-900"),
  };

  const collateralFactor = getCollateralFactor(collateralItem);
  const hasLoan = new BigNumber(vault.loanValue).gt(0);

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("pt-8 px-5 pb-14")}
      style={tailwind("flex-1")}
      testID="confirm_edit_collateral_screen"
    >
      <SummaryTitleV2
        title={translate(
          "screens/ConfirmEditCollateralScreen",
          isAdd ? "You are adding collateral" : "You are removing collateral"
        )}
        amount={amount}
        testID="text_collateral_amount"
        iconA={token.displaySymbol}
        toAddress={address}
        toAddressLabel={addressLabel}
        amountTextStyle="text-xl"
        addressType={AddressType.WalletAddress}
        toAddressTitle={translate("screens/common", "On")}
      />
      {conversion?.isConversionRequired && (
        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-6"
            ),
            ...containerThemeOptions,
          }}
          lhs={{
            value: translate(
              "screens/ConfirmEditCollateralScreen",
              "Amount to convert"
            ),
            testID: "amount_to_convert_label",
            themedProps: lhsThemedProps,
          }}
          rhs={{
            value: conversion.conversionAmount.toFixed(8),
            suffix: " DFI",
            testID: "amount_to_convert_value",
            themedProps: rhsThemedProps,
            usdTextStyle: tailwind("text-sm"),
            usdContainerStyle: tailwind("pb-0 pt-1"),
            isConverting: isConverting,
          }}
        />
      )}
      <NumberRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-5"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmEditCollateralScreen",
            "Transaction fee"
          ),
          testID: "transaction_fee_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: getPrecisedCurrencyValue(fee),
          suffix: " DFI",
          testID: "transaction_fee_value",
          themedProps: rhsThemedProps,
          usdTextStyle: tailwind("text-sm"),
          usdContainerStyle: tailwind("pb-0 pt-1"),
        }}
      />
      <NumberRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-5"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmEditCollateralScreen",
            "Vault share"
          ),
          testID: "vault_share_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: vaultShare.toFixed(2),
          suffix: "%",
          testID: "vault_share_value",
          themedProps: rhsThemedProps,
        }}
      />
      <NumberRowV2
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent pt-5"),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmEditCollateralScreen",
            "Collateral factor"
          ),
          testID: "collateral_factor_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: collateralFactor.toFixed(2),
          suffix: "%",
          testID: "collateral_factor_value",
          themedProps: rhsThemedProps,
        }}
      />

      <TextRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-5"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate("screens/ConfirmEditCollateralScreen", "Vault ID"),
          testID: "vault_id_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: vault.vaultId,
          testID: "vault_id_value",
          numberOfLines: 1,
          ellipsizeMode: "middle",
          themedProps: rhsThemedProps,
        }}
      />
      <CollateralRatioRow
        type={hasLoan ? "number" : "text"}
        value={hasLoan ? resultingColRatio.toFixed(2) : "Ready for loan"}
        rhsThemedProps={{
          light: tailwind(
            hasLoan ? `text-${collateralizationColor}` : "text-green-v2"
          ),
          dark: tailwind(
            hasLoan ? `text-${collateralizationColor}` : "text-green-v2"
          ),
        }}
        testID="confirm_collateral_ratio"
      />
      <NumberRowV2
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent pt-5"),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmEditCollateralScreen",
            "Available loan"
          ),
          testID: "available_loan_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: getPrecisedCurrencyValue(vault.loanValue),
          testID: "available_loan_value",
          prefix: "$",
          themedProps: rhsThemedProps,
        }}
      />
      <NumberRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-b-0.5 pt-5"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmEditCollateralScreen",
            "Amount to add"
          ),
          testID: "collateral_amount_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: amount.toFixed(8),
          testID: "collateral_amount_value",
          usdAmount: getCollateralValue(amount, collateralItem),
          usdTextStyle: tailwind("text-sm"),
          usdContainerStyle: tailwind("pt-1"),
          themedProps: {
            light: tailwind("text-mono-light-v2-900 font-semibold-v2"),
            dark: tailwind("text-mono-dark-v2-900 font-semibold-v2"),
          },
        }}
      />

      <View style={tailwind("pt-12 px-7")}>
        <SubmitButtonGroupV2
          isDisabled={hasPendingJob || hasPendingBroadcastJob}
          label={translate(
            "screens/ConfirmEditCollateralScreen",
            isAdd ? "Add collateral" : "Remove collateral"
          )}
          onSubmit={onSubmit}
          onCancel={onCancel}
          displayCancelBtn
          title="confirm_edit_collateral"
          buttonStyle="mb-5.5"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

interface ModifyCollateralForm {
  vaultId: string;
  tokenAmount: BigNumber;
  token: TokenData;
  isAdd: boolean;
}

async function modifyCollateral(
  { vaultId, tokenAmount, token, isAdd }: ModifyCollateralForm,
  dispatch: Dispatch<any>,
  logger: NativeLoggingProps,
  onBroadcast: () => void,
  onConfirmation: () => void
): Promise<void> {
  try {
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const script = await account.getScript();
      const builder = account.withTransactionBuilder();

      const signed: TransactionSegWit = isAdd
        ? await builder.loans.depositToVault(
            {
              vaultId,
              from: script,
              tokenAmount: {
                token: +token.id,
                amount: tokenAmount,
              },
            },
            script
          )
        : await builder.loans.withdrawFromVault(
            {
              vaultId,
              tokenAmount: {
                token: +token.id,
                amount: tokenAmount,
              },
              to: script,
            },
            script
          );
      return new CTransactionSegWit(signed);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/EditCollateralScreen",
          isAdd
            ? "Adding {{amount}} {{symbol}} as collateral"
            : "Removing {{amount}} {{symbol}} as collateral",
          {
            amount: tokenAmount.toFixed(8),
            symbol: token.displaySymbol,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            isAdd
              ? "Preparing to add collaterals…"
              : "Preparing to remove collaterals…",
            {
              amount: tokenAmount.toFixed(8),
              symbol: token.displaySymbol,
            }
          ),
          waiting: translate(
            "screens/OceanInterface",
            isAdd
              ? "Adding {{amount}} {{symbol}} as collateral"
              : "Removing {{amount}} {{symbol}} as collateral",
            {
              amount: tokenAmount.toFixed(8),
              symbol: token.displaySymbol,
            }
          ),
          complete: translate(
            "screens/OceanInterface",
            isAdd
              ? "Added {{amount}} {{symbol}} as collateral"
              : "Removed {{amount}} {{symbol}} as collateral",
            {
              amount: tokenAmount.toFixed(8),
              symbol: token.displaySymbol,
            }
          ),
        },
        onConfirmation,
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
