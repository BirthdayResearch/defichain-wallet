import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import { TokenData } from "@defichain/whale-api-client/dist/api/tokens";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { DFITokenSelector, DFIUtxoSelector } from "@store/wallet";
import {
  getPrecisedCurrencyValue,
  getPrecisedTokenValue,
} from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import {
  AmountButtonTypes,
  TransactionCard,
} from "@components/TransactionCard";
import { useToast } from "react-native-toast-notifications";
import { useForm } from "react-hook-form";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { ButtonV2 } from "@components/ButtonV2";
import { useBottomSheet } from "@hooks/useBottomSheet";
import {
  BottomSheetTokenList,
  TokenType,
} from "@components/BottomSheetTokenList";
import { CollateralFactorTag } from "@components/CollateralFactorTag";
import { TextRowV2 } from "@components/TextRowV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { queueConvertTransaction } from "@hooks/wallet/Conversion";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";
import { ActiveUSDValueV2 } from "../VaultDetail/components/ActiveUSDValueV2";
import { LoanParamList } from "../LoansNavigator";
import { useResultingCollateralizationRatioByCollateral } from "../hooks/CollateralizationRatioV2";
import {
  getCollateralValue,
  getVaultShare,
  useValidCollateralRatio,
} from "../hooks/CollateralPrice";
import { CollateralItem } from "../screens/EditCollateralScreen";
import { ControlledTextInput } from "../components/ControlledTextInput";
import { BottomSheetTokenListHeader } from "../components/BottomSheetTokenListHeader";
import { CollateralizationRatioDisplayV2 } from "../components/CollateralizationRatioDisplayV2";

type Props = StackScreenProps<LoanParamList, "AddOrRemoveCollateralScreen">;

export interface AddOrRemoveCollateralResponse {
  collateralItem: CollateralItem;
  amount: BigNumber;
  token: TokenData;
}

export function AddOrRemoveCollateralScreen({ route }: Props): JSX.Element {
  const { vault, collateralItem, collateralTokens, isAdd } = route.params;
  const [selectedCollateralItem, setSelectedCollateralItem] =
    useState<CollateralItem>(collateralItem);

  const { control, formState, setValue, trigger, watch } = useForm<{
    collateralAmount: string;
  }>({ mode: "onChange" });
  const { collateralAmount } = watch();

  const client = useWhaleApiClient();
  const logger = useLogger();

  const dispatch = useAppDispatch();
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet)
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet)
  );

  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );

  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const { isFeatureAvailable } = useFeatureFlagContext();

  const TOAST_DURATION = 2000;
  const toast = useToast();

  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();

  const isConversionRequired =
    isAdd && selectedCollateralItem.token.id === "0"
      ? new BigNumber(collateralAmount).isGreaterThan(DFIToken.amount) &&
        new BigNumber(collateralAmount).isLessThanOrEqualTo(
          selectedCollateralItem.available
        )
      : false;

  const collateralInputAmount = new BigNumber(collateralAmount).isNaN()
    ? 0
    : collateralAmount;
  const collateralInputValue = getCollateralValue(
    new BigNumber(collateralInputAmount),
    selectedCollateralItem
  );

  // Vault collaterals value
  const currentVaultCollateralValue =
    new BigNumber(vault.collateralValue) ?? new BigNumber(0);
  const totalVaultCollateralValue = isAdd
    ? new BigNumber(currentVaultCollateralValue).plus(collateralInputValue)
    : new BigNumber(currentVaultCollateralValue).minus(collateralInputValue);
  const totalVaultCollateralValueInUSD = new BigNumber(
    getPrecisedTokenValue(totalVaultCollateralValue)
  );

  // Collateral value for selected token
  const currentTokenBalance =
    vault?.collateralAmounts?.find(
      (c) => c.id === selectedCollateralItem?.token.id
    )?.amount ?? "0";
  const totalTokenBalance = isAdd
    ? new BigNumber(currentTokenBalance)?.plus(collateralInputAmount)
    : BigNumber.max(
        0,
        new BigNumber(currentTokenBalance)?.minus(collateralInputAmount)
      );
  const tokenCollateralValue = getCollateralValue(
    totalTokenBalance,
    selectedCollateralItem
  );
  const totalTokenValueInUSD = new BigNumber(
    getPrecisedTokenValue(tokenCollateralValue)
  );

  const activePrice = new BigNumber(
    getActivePrice(
      selectedCollateralItem.token.symbol,
      selectedCollateralItem.activePrice,
      selectedCollateralItem.factor,
      "ACTIVE",
      "COLLATERAL"
    )
  );
  const collateralVaultShare =
    getVaultShare(totalTokenBalance, activePrice, totalVaultCollateralValue) ??
    new BigNumber(0);

  const { resultingColRatio } = useResultingCollateralizationRatioByCollateral({
    collateralValue: collateralAmount,
    collateralRatio: new BigNumber(vault.informativeRatio ?? NaN),
    minCollateralRatio: new BigNumber(vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(vault.loanValue),
    totalCollateralValueInUSD: totalVaultCollateralValueInUSD,
  });

  const {
    requiredVaultShareTokens,
    requiredTokensShare,
    minRequiredTokensShare,
    hasLoan,
  } = useValidCollateralRatio(
    vault?.collateralAmounts ?? [],
    totalVaultCollateralValue,
    new BigNumber(vault.loanValue),
    selectedCollateralItem.token.id,
    totalTokenBalance
  );
  const isValidCollateralRatio = requiredTokensShare?.gte(
    minRequiredTokensShare
  );
  const displayMinVaultShareRequiredError =
    isFeatureAvailable("dusd_vault_share") &&
    !isAdd &&
    !isValidCollateralRatio &&
    hasLoan &&
    requiredVaultShareTokens.includes(selectedCollateralItem.token.symbol);

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  async function onPercentageChange(
    amount: string,
    type: AmountButtonTypes
  ): Promise<void> {
    setValue("collateralAmount", amount);
    await trigger("collateralAmount");
    showToast(type);
  }

  function showToast(type: AmountButtonTypes): void {
    toast.hideAll();
    const toastOptionsOnAdd = {
      message:
        type === AmountButtonTypes.Max
          ? "Max available {{symbol}} entered"
          : "{{percent}} of available {{symbol}} entered",
      params:
        type === AmountButtonTypes.Max
          ? { symbol: selectedCollateralItem.token.displaySymbol }
          : {
              percent: type,
              symbol: selectedCollateralItem.token.displaySymbol,
            },
    };
    const toastOptionsOnRemove = {
      message:
        type === AmountButtonTypes.Max
          ? "Max available collateral entered"
          : "{{percent}} of available collateral entered",
      params: type === AmountButtonTypes.Max ? {} : { percent: type },
    };
    toast.show(
      translate(
        "screens/AddOrRemoveCollateralScreen",
        isAdd ? toastOptionsOnAdd.message : toastOptionsOnRemove.message,
        isAdd ? toastOptionsOnAdd.params : toastOptionsOnRemove.params
      ),
      { type: "wallet_toast", placement: "top", duration: TOAST_DURATION }
    );
  }

  const onAddCollateral = async ({
    amount,
    token,
    collateralItem,
  }: AddOrRemoveCollateralResponse): Promise<void> => {
    const initialParams = {
      name: "ConfirmEditCollateralScreen",
      params: {
        vault,
        amount,
        token,
        fee,
        collateralItem,
        resultingColRatio,
        totalVaultCollateralValue,
        vaultShare: collateralVaultShare,
        conversion: undefined,
        isAdd: true,
      },
    };
    if (isConversionRequired) {
      const conversionAmount = new BigNumber(amount).minus(DFIToken.amount);
      initialParams.params.conversion = {
        DFIUtxo,
        DFIToken,
        isConversionRequired,
        conversionAmount: new BigNumber(amount).minus(DFIToken.amount),
      } as any;
      queueConvertTransaction(
        {
          mode: "utxosToAccount",
          amount: conversionAmount,
        },
        dispatch,
        () => {
          navigation.navigate(initialParams);
        },
        logger
      );
    } else {
      navigation.navigate(initialParams);
    }
  };

  const onRemoveCollateral = async ({
    amount,
    token,
    collateralItem,
  }: AddOrRemoveCollateralResponse): Promise<void> => {
    navigation.navigate({
      name: "ConfirmEditCollateralScreen",
      params: {
        vault,
        amount,
        token,
        fee,
        collateralItem,
        resultingColRatio,
        totalVaultCollateralValue,
        vaultShare: collateralVaultShare,
        conversion: undefined,
        isAdd: false,
      },
    });
  };

  const handleEditCollateral = async (): Promise<void> => {
    const collateralItem = collateralTokens.find(
      (col) => col.token.id === selectedCollateralItem.token.id
    );
    if (vault === undefined || collateralItem === undefined) {
      return;
    }

    const params = {
      collateralItem,
      amount: new BigNumber(collateralAmount),
      token: selectedCollateralItem.token,
    };
    if (isAdd) {
      onAddCollateral(params);
    } else {
      onRemoveCollateral(params);
    }
  };

  const lhsThemedProps = {
    light: tailwind("text-mono-light-v2-500"),
    dark: tailwind("text-mono-dark-v2-500"),
  };
  const rhsThemedProps = {
    light: tailwind("text-mono-light-v2-900"),
    dark: tailwind("text-mono-dark-v2-900"),
  };

  const disableSubmitButton =
    !formState.isValid ||
    hasPendingJob ||
    hasPendingBroadcastJob ||
    displayMinVaultShareRequiredError;

  return (
    <ThemedScrollViewV2
      ref={containerRef}
      style={tailwind("flex-col flex-1")}
      testID="add_remove_collateral_screen"
      contentContainerStyle={tailwind(
        "flex-grow justify-between pt-8 px-5 pb-14"
      )}
    >
      <View>
        {/* Header Title */}
        <ThemedTextV2
          style={tailwind("mx-5 text-xs font-normal-v2")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {translate(
            "screens/AddOrRemoveCollateralScreen",
            isAdd ? "I WANT TO ADD" : "I WANT TO REMOVE"
          )}
        </ThemedTextV2>

        {/* Quick Inputs and text input */}
        <TransactionCard
          maxValue={
            isAdd
              ? selectedCollateralItem.available
              : new BigNumber(currentTokenBalance)
          }
          onChange={onPercentageChange}
          disabled={selectedCollateralItem === undefined}
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
            style={tailwind(
              "flex flex-row justify-between items-center mt-4 ml-5"
            )}
          >
            <View style={tailwind("w-6/12 mr-2")}>
              <ControlledTextInput
                name="collateralAmount"
                control={control}
                testID="text_input_add_remove_collateral_amount"
                inputProps={{
                  keyboardType: "numeric",
                  placeholder: "0.00",
                  editable: selectedCollateralItem !== undefined,
                  onChangeText: async (amount: string) => {
                    amount = isNaN(+amount) ? "0" : amount;
                    setValue("collateralAmount", amount);
                    await trigger("collateralAmount");
                  },
                }}
                value={collateralAmount}
                rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  validate: {
                    hasSufficientFunds: (value: string) =>
                      isAdd
                        ? selectedCollateralItem.available.gte(value)
                        : new BigNumber(currentTokenBalance).gte(value),
                  },
                }}
              />
              <ActiveUSDValueV2
                price={collateralInputValue}
                testId="add_remove_collateral_amount_in_usd"
                containerStyle={tailwind("w-full break-words")}
                style={tailwind("text-sm")}
              />
            </View>

            <TokenDropdownButton
              symbol={selectedCollateralItem.token.displaySymbol}
              testID="add_remove_collateral_quick_input"
              onPress={() => {
                setBottomSheetScreen([
                  {
                    stackScreenName: "TokenList",
                    component: BottomSheetTokenList({
                      tokens: collateralTokens,
                      tokenType: TokenType.CollateralItem,
                      vault: vault,
                      onTokenPress: async (token) => {
                        setSelectedCollateralItem(token as CollateralItem);
                        if (selectedCollateralItem?.tokenId !== token.tokenId) {
                          setValue("collateralAmount", "");
                          await trigger("collateralAmount");
                        }
                        dismissModal();
                      },
                    }),
                    option: {
                      headerTitle: "",
                      headerBackTitleVisible: false,
                      headerStyle: tailwind("rounded-t-xl-v2 border-b-0"),
                      header: () => (
                        <BottomSheetTokenListHeader
                          headerLabel={translate(
                            "screens/AddOrRemoveCollateralScreen",
                            "Select Collateral"
                          )}
                          onCloseButtonPress={dismissModal}
                        />
                      ),
                    },
                  },
                ]);
                expandModal();
              }}
              status={
                isAdd
                  ? TokenDropdownButtonStatus.Enabled
                  : TokenDropdownButtonStatus.Locked
              }
            />
          </View>
        </TransactionCard>

        {/* Display available balance for selected token */}
        {(Object.keys(formState.errors).length <= 0 ||
          formState.errors.collateralAmount?.type === "required") &&
          !isConversionRequired &&
          !displayMinVaultShareRequiredError && (
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
              style={tailwind("text-xs pt-2 mx-5 font-normal-v2")}
              testID="add_remove_collateral_token_balance"
            >
              {isAdd
                ? translate(
                    "screens/AddOrRemoveCollateralScreen",
                    "Available: {{amount}} {{symbol}}",
                    {
                      amount: selectedCollateralItem.available.toFixed(8),
                      symbol: selectedCollateralItem.token.displaySymbol,
                    }
                  )
                : translate(
                    "screens/AddOrRemoveCollateralScreen",
                    "Available: {{amount}} {{symbol}} collateral",
                    {
                      amount: currentTokenBalance,
                      symbol: selectedCollateralItem.token.displaySymbol,
                    }
                  )}
            </ThemedTextV2>
          )}

        {/* Conversion required warning */}
        {isConversionRequired && (
          <ThemedTextV2
            light={tailwind("text-orange-v2")}
            dark={tailwind("text-orange-v2")}
            style={tailwind("text-xs pt-2 mx-5 font-normal-v2")}
            testID="conversion_required_warning"
          >
            {translate(
              "screens/AddOrRemoveCollateralScreen",
              "A small amount of UTXO is reserved for fees"
            )}
          </ThemedTextV2>
        )}

        {/* Insufficient balance error */}
        {formState.errors.collateralAmount?.type === "hasSufficientFunds" && (
          <ThemedTextV2
            light={tailwind("text-red-v2")}
            dark={tailwind("text-red-v2")}
            style={tailwind("text-xs pt-2 mx-5 font-normal-v2")}
            testID="add_remove_collateral_insufficient_balance"
          >
            {translate(
              "screens/AddOrRemoveCollateralScreen",
              isAdd
                ? "Insufficient Balance"
                : "Amount entered is higher than collateral"
            )}
          </ThemedTextV2>
        )}

        {/* Min vault share required error */}
        {displayMinVaultShareRequiredError && formState.isValid && (
          <ThemedTextV2
            light={tailwind("text-red-v2")}
            dark={tailwind("text-red-v2")}
            style={tailwind("text-xs pt-2 mx-5 font-normal-v2")}
            testID="vault_min_share_warning"
          >
            {translate(
              "screens/BorrowLoanTokenScreen",
              "Vault needs at least 50% DFI share"
            )}
          </ThemedTextV2>
        )}
      </View>

      <ThemedViewV2
        light={tailwind("border-mono-light-v2-300")}
        dark={tailwind("border-mono-dark-v2-300")}
        style={tailwind("p-5 mt-6 border-0.5 rounded-lg-v2")}
      >
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
        >
          <TextRowV2
            containerStyle={{
              style: tailwind("flex-row items-start w-full"),
              light: tailwind("bg-transparent"),
              dark: tailwind("bg-transparent"),
            }}
            lhs={{
              value: translate(
                "screens/AddOrRemoveCollateralScreen",
                "Vault ID"
              ),
              testID: "add_remove_collateral_vault_id_label",
              themedProps: lhsThemedProps,
            }}
            rhs={{
              value: vault.vaultId,
              testID: `add_remove_collateral_vault_id`,
              numberOfLines: 1,
              ellipsizeMode: "middle",
              themedProps: rhsThemedProps,
            }}
          />
          <NumberRowV2
            info={{
              title: "Vault Share",
              message:
                "Vault share indicates the percentage a token will represent based on the total collateral value.",
              iconStyle: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            containerStyle={{
              style: tailwind("flex-row items-start mt-5"),
            }}
            lhs={{
              value: translate(
                "screens/AddOrRemoveCollateralScreen",
                "Vault share"
              ),
              testID: "add_remove_collateral_vault_share",
              themedProps: lhsThemedProps,
            }}
            rhs={{
              value: collateralVaultShare.isNaN()
                ? 0
                : collateralVaultShare.toFixed(2),
              testID: "add_remove_collateral_vault_share",
              suffix: "%",
              themedProps: rhsThemedProps,
            }}
          />
          <NumberRowV2
            info={{
              title: "Available Loan",
              message:
                "This is the current loan amount available for this vault.",
              iconStyle: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            containerStyle={{
              style: tailwind("flex-row items-start w-full mt-5"),
            }}
            lhs={{
              value: translate(
                "screens/AddOrRemoveCollateralScreen",
                "Available loan"
              ),
              testID: "add_remove_collateral_loan",
              themedProps: lhsThemedProps,
            }}
            rhs={{
              value: getPrecisedCurrencyValue(vault.loanValue),
              testID: "add_remove_collateral_loan",
              prefix: "$",
              themedProps: rhsThemedProps,
            }}
          />
          <TotalTokenCollateralRow
            totalTokenBalance={totalTokenBalance}
            totalUsdAmount={totalTokenValueInUSD}
            symbol={selectedCollateralItem.token.displaySymbol}
            collateralFactor={selectedCollateralItem.factor}
          />
          <View style={tailwind("pt-5")}>
            <CollateralizationRatioDisplayV2
              collateralizationRatio={resultingColRatio.toFixed(2)}
              minCollateralizationRatio={vault.loanScheme.minColRatio}
              totalLoanAmount={vault.loanValue}
              testID="add_remove_collateral"
              collateralValue={totalVaultCollateralValue.toFixed(8)}
              showProgressBar
            />
          </View>
        </ThemedViewV2>
      </ThemedViewV2>

      <View style={tailwind("pt-16 px-7")}>
        {!disableSubmitButton && (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            style={tailwind("text-center text-xs font-normal-v2")}
          >
            {translate(
              "screens/AddOrRemoveCollateralScreen",
              isConversionRequired
                ? "By continuing, the required amount of DFI will be converted"
                : "Review full details in the next screen"
            )}
          </ThemedTextV2>
        )}

        <ButtonV2
          fillType="fill"
          label={translate("components/Button", "Continue")}
          disabled={disableSubmitButton}
          styleProps="mt-5"
          onPress={handleEditCollateral}
          testID="add_remove_collateral_button_submit"
        />
      </View>

      {Platform.OS === "web" && (
        <BottomSheetWebWithNavV2
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          // eslint-disable-next-line react-native/no-inline-styles
          modalStyle={{
            position: "absolute",
            bottom: "0",
            height: "70%",
            width: "100%",
            zIndex: 50,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            overflow: "hidden",
          }}
        />
      )}

      {Platform.OS !== "web" && (
        <BottomSheetWithNavV2
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: ["70%"],
            android: ["70%"],
          }}
        />
      )}
    </ThemedScrollViewV2>
  );
}

function TotalTokenCollateralRow(props: {
  totalTokenBalance: BigNumber;
  totalUsdAmount: BigNumber;
  symbol: string;
  collateralFactor: string;
}): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind("flex-row items-start w-full mt-5")}
      light={tailwind("bg-transparent")}
      dark={tailwind("bg-transparent")}
    >
      <View style={tailwind("w-5/12")}>
        <View style={tailwind("flex-row items-center justify-start")}>
          <ThemedTextV2
            style={tailwind("text-sm font-normal-v2")}
            testID="add_remove_collateral_total_label"
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
          >
            {translate(
              "screens/AddOrRemoveCollateralScreen",
              "Total collateral"
            )}
          </ThemedTextV2>
        </View>
        <View style={tailwind("flex flex-row mt-1")}>
          <CollateralFactorTag factor={props.collateralFactor} />
        </View>
      </View>
      <View style={tailwind("flex-1")}>
        <View>
          <View
            style={tailwind("flex flex-row justify-end flex-wrap items-center")}
          >
            <NumberFormat
              decimalScale={8}
              displayType="text"
              suffix={` ${props.symbol}`}
              renderText={(val: string) => (
                <ThemedTextV2
                  style={tailwind("text-right font-normal-v2 text-sm")}
                  testID="add_remove_collateral_total"
                  light={tailwind("text-mono-light-v2-900")}
                  dark={tailwind("text-mono-dark-v2-900")}
                >
                  {val}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={props.totalTokenBalance.toFixed(8)}
            />
          </View>
        </View>
        <View
          style={tailwind("flex flex-row justify-end flex-wrap items-center")}
        >
          <ActiveUSDValueV2
            price={props.totalUsdAmount}
            containerStyle={tailwind("pt-1 pb-0")}
            testId="add_remove_collateral_total_usd_amount"
            style={tailwind("text-sm")}
          />
        </View>
      </View>
    </ThemedViewV2>
  );
}
