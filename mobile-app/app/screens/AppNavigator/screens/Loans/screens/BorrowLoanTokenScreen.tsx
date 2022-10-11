import { Platform, View } from "react-native";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { fetchVaults, vaultsSelector } from "@store/loans";
import {
  LoanToken,
  LoanVaultActive,
} from "@defichain/whale-api-client/dist/api/loan";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { getActivePrice } from "@screens/AppNavigator/screens/Auctions/helpers/ActivePrice";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useIsFocused } from "@react-navigation/native";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { useAppDispatch } from "@hooks/useAppDispatch";
import {
  AmountButtonTypes,
  TransactionCard,
} from "@components/TransactionCard";
import { Controller, useForm } from "react-hook-form";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import { ButtonV2 } from "@components/ButtonV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import { useToast } from "react-native-toast-notifications";
import { useBottomSheet } from "@hooks/useBottomSheet";
import {
  useCollateralizationRatioColor,
  useColRatioThreshold,
} from "../hooks/CollateralizationRatio";
import { ActiveUSDValueV2 } from "../VaultDetail/components/ActiveUSDValueV2";
import { LoanParamList } from "../LoansNavigator";
import { BottomSheetVaultList } from "../components/BottomSheetVaultList";
import {
  useResultingCollateralRatio,
  useValidCollateralRatio,
} from "../hooks/CollateralPrice";
import { useMaxLoan } from "../hooks/MaxLoanAmount";
import { useInterestPerBlock } from "../hooks/InterestPerBlock";
import { useBlocksPerDay } from "../hooks/BlocksPerDay";

type Props = StackScreenProps<LoanParamList, "BorrowLoanTokenScreen">;

export function BorrowLoanTokenScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const { loanToken } = route.params;
  const client = useWhaleApiClient();
  const { isLight } = useThemeContext();
  const isFocused = useIsFocused();
  const logger = useLogger();
  const { address } = useWalletContext();
  const dispatch = useAppDispatch();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const [vault, setVault] = useState<LoanVaultActive | undefined>(
    route.params.vault
  );
  const [amountToBorrow, setAmountToBorrow] = useState({
    amountInToken: new BigNumber(0),
    amountInUSD: new BigNumber(0),
    amountInput: "",
  });

  const [totalAnnualInterest, setTotalAnnualInterest] = useState(
    new BigNumber(NaN)
  );
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const interestPerBlock = useInterestPerBlock(
    new BigNumber(vault?.loanScheme.interestRate ?? NaN),
    new BigNumber(loanToken.interest)
  );

  const { requiredTokensShare } = useValidCollateralRatio(
    vault?.collateralAmounts ?? [],
    new BigNumber(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN)
  );
  const maxLoanAmount = useMaxLoan({
    totalCollateralValue: new BigNumber(vault?.collateralValue ?? 0),
    collateralAmounts: vault?.collateralAmounts ?? [],
    existingLoanValue: new BigNumber(vault?.loanValue ?? 0),
    minColRatio: new BigNumber(vault?.loanScheme.minColRatio ?? 0),
    loanActivePrice: new BigNumber(
      getActivePrice(loanToken.token.symbol, loanToken.activePrice)
    ),
    interestPerBlock: interestPerBlock,
  });
  const blocksPerDay = useBlocksPerDay();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );

  const { control, formState, setValue, trigger, watch } = useForm<{
    borrowAmount: string;
  }>({ mode: "onChange" });
  const { borrowAmount } = watch();

  const resultingColRatio = useResultingCollateralRatio(
    new BigNumber(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN),
    new BigNumber(borrowAmount),
    new BigNumber(
      getActivePrice(loanToken.token.symbol, loanToken.activePrice)
    ),
    interestPerBlock
  );

  const { atRiskThreshold } = useColRatioThreshold(
    new BigNumber(vault?.loanScheme.minColRatio ?? 0)
  );

  const { light: resultingColRatioLight, dark: resultingColRatioDark } =
    useCollateralizationRatioColor({
      colRatio: resultingColRatio,
      minColRatio: new BigNumber(vault?.loanScheme.minColRatio ?? 0),
      totalLoanAmount: new BigNumber(vault?.loanValue ?? 0).plus(
        borrowAmount ?? 0
      ),
    });

  // Bottom sheet
  const bottomSheetScreen = useMemo(() => {
    return [
      {
        stackScreenName: "VaultList",
        component: BottomSheetVaultList({
          headerLabel: translate(
            "screens/BorrowLoanTokenScreen",
            "Select Vault to Use"
          ),
          onCloseButtonPress: () => dismissModal(),
          onVaultPress: (vault: LoanVaultActive) => {
            setVault(vault);
            dismissModal();
          },
          vaults,
        }),
        option: {
          header: () => null,
        },
      },
    ];
  }, []);
  const {
    bottomSheetRef,
    containerRef,
    isModalDisplayed,
    dismissModal,
    expandModal,
  } = useBottomSheet();
  const onLoanTokenInputPress = (): void => {
    navigation.navigate({
      name: "ChooseLoanTokenScreen",
      params: {},
      merge: true,
    });
  };

  // Form update
  enum ValidationMessageType {
    Warning,
    Error,
  }
  const [inputValidationMessage, setInputValidationMessage] = useState<{
    message: string;
    type: ValidationMessageType;
  }>();

  async function onPercentagePress(
    amount: string,
    type: AmountButtonTypes
  ): Promise<void> {
    setValue("borrowAmount", amount);
    await trigger("borrowAmount");
    showToast(type);
  }

  // Toast
  const toast = useToast();
  const TOAST_DURATION = 2000;
  function showToast(type: AmountButtonTypes): void {
    if (vault === undefined) {
      return;
    }

    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available loan entered"
      : "{{percent}} of available loan entered";
    const toastOption = {
      percent: type,
    };
    toast.show(
      translate("screens/CompositeSwapScreen", toastMessage, toastOption),
      {
        type: "wallet_toast",
        placement: "top",
        duration: TOAST_DURATION,
      }
    );
  }

  const updateInterestAmount = (): void => {
    const loanTokenPrice = getActivePrice(
      loanToken.token.symbol,
      loanToken.activePrice
    );
    if (
      vault === undefined ||
      borrowAmount === undefined ||
      loanTokenPrice === "0"
    ) {
      return;
    }
    const annualInterest = interestPerBlock
      .multipliedBy(blocksPerDay * 365)
      .multipliedBy(borrowAmount);
    setTotalAnnualInterest(annualInterest);
  };

  const onSubmit = async (): Promise<void> => {
    if (
      !formState.isValid ||
      vault === undefined ||
      hasPendingJob ||
      hasPendingBroadcastJob
    ) {
      return;
    }

    navigation.navigate({
      name: "ConfirmBorrowLoanTokenScreen",
      params: {
        loanToken: loanToken,
        vault: vault,
        amountToBorrow: borrowAmount,
        totalInterestAmount: interestPerBlock,
        totalLoanWithInterest: totalAnnualInterest,
        fee,
        resultingColRatio,
      },
    });
  };

  const validateInput = (): void => {
    const amount = new BigNumber(borrowAmount);
    if (amount.isNaN() || amount.isZero() || vault === undefined) {
      setInputValidationMessage(undefined);
      return;
    }

    if (requiredTokensShare.isZero()) {
      setInputValidationMessage({
        message:
          "A minimum of 50% DFI as collateral is required before borrowing DUSD",
        type: ValidationMessageType.Error,
      });
    } else if (resultingColRatio.isLessThan(vault.loanScheme.minColRatio)) {
      setInputValidationMessage({
        message:
          "Borrowing the amount entered will result in vault liquidation",
        type: ValidationMessageType.Error,
      });
    } else if (resultingColRatio < atRiskThreshold) {
      setInputValidationMessage({
        message:
          "Amount entered may liquidate the vault. Proceed at your own risk.",
        type: ValidationMessageType.Warning,
      });
    } else {
      setInputValidationMessage(undefined);
    }
  };

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchVaults({ address, client }));
    }
  }, [blockCount, address, isFocused]);

  useEffect(() => {
    const updatedVault = vaults.find(
      (v) => v.vaultId === vault?.vaultId
    ) as LoanVaultActive;
    setVault(updatedVault);
  }, [vaults]);

  useEffect(() => {
    updateInterestAmount();
    validateInput();
  }, [borrowAmount, vault, loanToken]);

  useEffect(() => {
    setAmountToBorrow({
      ...amountToBorrow,
      amountInToken: new BigNumber(amountToBorrow.amountInput),
      amountInUSD:
        amountToBorrow.amountInput === "" ||
        new BigNumber(amountToBorrow.amountInput).isNaN()
          ? new BigNumber(0)
          : new BigNumber(amountToBorrow.amountInput).times(
              getActivePrice(loanToken.token.symbol, loanToken.activePrice)
            ),
    });
  }, [amountToBorrow.amountInput]);

  return (
    <View style={tailwind("flex-1")} ref={containerRef}>
      <ThemedScrollViewV2
        contentContainerStyle={tailwind(
          "flex flex-col justify-between pb-8 mb-8 px-4"
        )}
      >
        <View>
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2 mt-8 mx-5")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
          >
            {translate("screens/BorrowLoanTokenScreen", "I WANT TO BORROW")}
          </ThemedTextV2>

          <TransactionCard
            maxValue={new BigNumber(borrowAmount != null ? maxLoanAmount : 0)}
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
            disabled={vault === undefined || maxLoanAmount.isZero()}
          >
            <View
              style={tailwind(
                "flex flex-row justify-between items-center mt-4"
              )}
            >
              <View style={tailwind("w-6/12 mr-2 pl-5")}>
                <Controller
                  control={control}
                  defaultValue=""
                  name="borrowAmount"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInputV2
                      style={tailwind("text-xl font-semibold-v2 w-full")}
                      light={tailwind("text-mono-light-v2-900", {
                        "opacity-30": vault === undefined,
                      })}
                      dark={tailwind("text-mono-dark-v2-900", {
                        "opacity-30": vault === undefined,
                      })}
                      keyboardType="numeric"
                      value={value}
                      onBlur={async () => {
                        await onChange(value?.trim());
                      }}
                      onChangeText={async (amount) => {
                        amount = isNaN(+amount) ? "0" : amount;
                        setValue("borrowAmount", amount);
                        await trigger("borrowAmount");
                      }}
                      placeholder="0.00"
                      placeholderTextColor={getColor(
                        isLight ? "mono-light-v2-900" : "mono-dark-v2-900"
                      )}
                      // ref={amountInputRef}
                      testID="text_input_borrow_amount"
                      editable={vault !== undefined}
                    />
                  )}
                  rules={{
                    required: true,
                    pattern: /^\d*\.?\d*$/,
                    max: vault !== undefined ? maxLoanAmount.toFixed(8) : "0",
                    validate: {
                      greaterThanZero: (value: string) =>
                        new BigNumber(
                          value !== undefined && value !== "" ? value : 0
                        ).isGreaterThan(0),
                    },
                  }}
                />
                <ActiveUSDValueV2
                  price={new BigNumber(
                    typeof borrowAmount === "string" && borrowAmount.length > 0
                      ? borrowAmount
                      : 0
                  ).multipliedBy(
                    getActivePrice(
                      loanToken.token.symbol,
                      loanToken.activePrice
                    )
                  )}
                  testId="borrow_amount_in_usd"
                  containerStyle={tailwind("w-full break-words")}
                />
              </View>

              <TokenDropdownButton
                symbol={loanToken.token.displaySymbol}
                testID="loan_token_dropdown"
                onPress={() => {}}
                status={TokenDropdownButtonStatus.Enabled}
              />
            </View>
          </TransactionCard>

          <VaultInput vault={vault} onPress={expandModal} />
          {vault !== undefined && new BigNumber(borrowAmount).isGreaterThan(0) && (
            <ThemedTextV2 style={tailwind("ml-5 mt-2 font-normal-v2 text-xs")}>
              {translate("BorrowLoanTokenScreen", "Collateral Ratio: ")}
              <NumberFormat
                value={new BigNumber(resultingColRatio).toFixed(2)}
                decimalScale={2}
                thousandSeparator
                displayType="text"
                suffix="%"
                renderText={(value) => (
                  <ThemedTextV2
                    light={resultingColRatioLight}
                    dark={resultingColRatioDark}
                    testID="resulting_col_ratio"
                    style={tailwind("text-xs font-normal-v2")}
                  >
                    {`(${value})`}
                  </ThemedTextV2>
                )}
              />
            </ThemedTextV2>
          )}

          <TransactionDetailsSection
            vault={vault}
            loanToken={loanToken}
            maxLoanAmount={maxLoanAmount}
            fee={fee}
            totalAnnualInterest={totalAnnualInterest}
          />
        </View>

        <View style={tailwind("mx-7")}>
          {inputValidationMessage !== undefined ? (
            <ThemedTextV2
              style={tailwind("text-xs text-center font-normal-v2 mb-5")}
              light={tailwind({
                "text-red-v2":
                  inputValidationMessage.type === ValidationMessageType.Error,
                "text-orange-v2":
                  inputValidationMessage.type === ValidationMessageType.Warning,
              })}
              dark={tailwind({
                "text-red-v2":
                  inputValidationMessage.type === ValidationMessageType.Error,
                "text-orange-v2":
                  inputValidationMessage.type === ValidationMessageType.Warning,
              })}
            >
              {translate(
                "screens/BorrowLoanTokenScreen",
                inputValidationMessage.message
              )}
            </ThemedTextV2>
          ) : (
            <ThemedTextV2
              testID="transaction_details_hint_text"
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
              style={tailwind("mb-5 text-xs text-center font-normal-v2")}
            >
              {translate(
                "screens/BorrowLoanTokenScreen",
                "Review full details in the next screen"
              )}
            </ThemedTextV2>
          )}
          <ButtonV2
            fillType="fill"
            label={translate("components/Button", "Continue")}
            disabled={
              !formState.isValid || hasPendingJob || hasPendingBroadcastJob
            }
            styleProps=""
            onPress={onSubmit}
            testID="borrow_button_submit"
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
              height: "404px",
              width: "375px",
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
              ios: ["60%"],
              android: ["60%"],
            }}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

interface VaultInputProps {
  vault?: LoanVaultActive;
  onPress: () => void;
  testID?: string;
}

function VaultInput(props: VaultInputProps): JSX.Element {
  return (
    <View style={tailwind("")}>
      <ThemedSectionTitleV2
        text={translate("BorrowLoanTokenScreen", "WITH VAULT")}
      />
      <ThemedTouchableOpacityV2
        style={tailwind(
          "py-3.5 px-5 flex-row justify-between items-center rounded-lg-v2"
        )}
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
        onPress={props.onPress}
      >
        {props.vault === undefined ? (
          <ThemedTextV2
            style={tailwind("text-sm font-normal-v2")}
            light={tailwind("text-mono-light-v2-800")}
            dark={tailwind("text-mono-dark-v2-800")}
          >
            {translate("BorrowLoanTokenScreen", "Select vault")}
          </ThemedTextV2>
        ) : (
          <View style={tailwind("w-8/12")}>
            <ThemedTextV2
              ellipsizeMode="middle"
              numberOfLines={1}
              style={tailwind("text-sm font-normal-v2")}
              light={tailwind("text-mono-light-v2-800")}
              dark={tailwind("text-mono-dark-v2-800")}
            >
              {props.vault.vaultId}
            </ThemedTextV2>
          </View>
        )}

        <ThemedIcon
          iconType="Feather"
          name="chevron-down"
          size={24}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          style={tailwind("")}
        />
      </ThemedTouchableOpacityV2>
    </View>
  );
}

interface TransactionDetailsProps {
  vault?: LoanVaultActive;
  maxLoanAmount: BigNumber;
  loanToken: LoanToken;
  fee: BigNumber;
  totalAnnualInterest: BigNumber;
}

export function TransactionDetailsSection(
  props: TransactionDetailsProps
): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      style={tailwind("p-5 mt-6 mb-12 border-0.5 rounded-lg-v2")}
    >
      <NumberRowV2
        lhs={{
          value: translate("screens/BorrowLoanTokenScreen", "Available loan"),
          testID: "available_amount_label",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        info={{
          title: translate("screens/BorrowLoanTokenScreen", "Available Loans"),
          message: translate(
            "screens/BorrowLoanTokenScreen",
            "This is the current loan amount available for this vault."
          ),
        }}
        rhs={{
          value: props.maxLoanAmount.isNaN()
            ? new BigNumber(0).toFixed(8)
            : props.maxLoanAmount.toFixed(8),
          testID: "available_amount_value",
          suffix: ` ${props.loanToken.token.displaySymbol}`,
          themedProps: {
            style: tailwind("font-normal-v2 text-sm"),
          },
          usdAmount: props.maxLoanAmount.isNaN()
            ? new BigNumber(0)
            : props.maxLoanAmount.multipliedBy(
                getActivePrice(
                  props.loanToken.token.symbol,
                  props.loanToken.activePrice
                )
              ),
          usdTextStyle: tailwind("text-sm mt-1"),
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/BorrowLoanTokenScreen", "Price"),
          testID: "price_label",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: getPrecisedCurrencyValue(
            getActivePrice(
              props.loanToken.token.symbol,
              props.loanToken.activePrice
            )
          ),
          testID: "price_value",
          prefix: "$",
          themedProps: {
            style: tailwind("font-normal-v2 text-sm"),
          },
          subValue: {
            value: props.loanToken.interest ?? 0,
            suffix: translate("screens/BorrowLoanTokenScreen", "% interest"),
            testID: "price_interest_rate",
          },
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/BorrowLoanTokenScreen", "Total interest"),
          testID: "total_interest_label",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        info={{
          title: translate("screens/BorrowLoanTokenScreen", "Total Interest"),
          message: translate(
            "screens/BorrowLoanTokenScreen",
            "This includes both interest from the token and vault selected. Price is provided by price oracles."
          ),
        }}
        rhs={{
          value: props.totalAnnualInterest.isNaN()
            ? new BigNumber(0).toFixed(8)
            : props.totalAnnualInterest.toFixed(8),
          testID: "total_interest_value",
          suffix: ` ${props.loanToken.token.displaySymbol}`,
          themedProps: {
            style: tailwind("font-normal-v2 text-sm"),
          },
          usdAmount: props.totalAnnualInterest.isNaN()
            ? new BigNumber(0)
            : props.totalAnnualInterest.multipliedBy(
                getActivePrice(
                  props.loanToken.token.symbol,
                  props.loanToken.activePrice
                )
              ),
          usdTextStyle: tailwind("text-sm mt-1"),
        }}
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent pt-5"),
        }}
      />
      <ThemedViewV2
        style={tailwind("border-b-0.5 w-full mb-5")}
        light={tailwind("border-mono-light-v2-300")}
        dark={tailwind("border-mono-dark-v2-300")}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/BorrowLoanTokenScreen", "Transaction fees"),
          testID: "transaction_fee_label",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.fee.toFixed(8),
          testID: "transaction_fee_value",
          suffix: ` DFI`,
          themedProps: {
            style: tailwind("font-normal-v2 text-sm"),
          },
        }}
      />
    </ThemedViewV2>
  );
}
