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
import { fetchVaults, loanTokensSelector, vaultsSelector } from "@store/loans";
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
import { getActivePrice } from "@screens/AppNavigator/screens/Auctions/helpers/ActivePrice";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useIsFocused } from "@react-navigation/native";
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
import { useColRatioThreshold } from "../hooks/CollateralizationRatio";
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
import { BottomSheetLoanTokensList } from "../components/BottomSheetLoanTokensList";
import { useDFIRequirementForDusdLoanAndCollateral } from "../hooks/DFIRequirementForDusdLoanAndCollateral";
import { CollateralizationRatioDisplayV2 } from "../components/CollateralizationRatioDisplayV2";

type Props = StackScreenProps<LoanParamList, "BorrowLoanTokenScreen">;

export function BorrowLoanTokenScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const client = useWhaleApiClient();
  const { isLight } = useThemeContext();
  const isFocused = useIsFocused();
  const logger = useLogger();
  const { address } = useWalletContext();
  const dispatch = useAppDispatch();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );
  const [vault, setVault] = useState<LoanVaultActive>(route.params.vault);
  const [loanToken, setLoanToken] = useState<LoanToken>(route.params.loanToken);
  const [totalAnnualInterest, setTotalAnnualInterest] = useState(
    new BigNumber(NaN)
  );
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const interestPerBlock = useInterestPerBlock(
    new BigNumber(vault.loanScheme.interestRate ?? NaN),
    new BigNumber(loanToken.interest)
  );

  const { requiredTokensShare } = useValidCollateralRatio(
    vault.collateralAmounts,
    new BigNumber(vault.collateralValue),
    new BigNumber(vault.loanValue)
  );

  const maxLoanAmount = useMaxLoan({
    totalCollateralValue: new BigNumber(vault.collateralValue),
    collateralAmounts: vault.collateralAmounts,
    existingLoanValue: new BigNumber(vault.loanValue),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
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

  // Form Input
  const { control, formState, setValue, trigger, watch } = useForm<{
    borrowAmount: string;
  }>({ mode: "onChange" });
  const { borrowAmount } = watch();
  const resultingColRatio = useResultingCollateralRatio(
    new BigNumber(vault.collateralValue),
    new BigNumber(vault.loanValue),
    new BigNumber(borrowAmount).isNaN()
      ? new BigNumber(0)
      : new BigNumber(borrowAmount),
    new BigNumber(
      getActivePrice(loanToken.token.symbol, loanToken.activePrice)
    ),
    interestPerBlock
  );
  const [disableContinue, setDisableContinue] = useState(false);
  const { isDFILessThanHalfOfRequiredCollateral } =
    useDFIRequirementForDusdLoanAndCollateral({
      collateralAmounts: vault.collateralAmounts,
      loanAmounts: vault.loanAmounts,
      collateralValue: new BigNumber(vault.collateralValue),
      loanValue: new BigNumber(vault.loanValue).plus(
        new BigNumber(borrowAmount).isNaN()
          ? new BigNumber(0)
          : new BigNumber(borrowAmount)
      ),
      loanToken: loanToken,
      minColRatio: vault.loanScheme.minColRatio,
    });
  const { atRiskThreshold } = useColRatioThreshold(
    new BigNumber(vault.loanScheme.minColRatio)
  );

  // Bottom sheet
  const bottomSheetVaultList = useMemo(() => {
    return [
      {
        stackScreenName: "VaultList",
        component: BottomSheetVaultList({
          headerLabel: translate(
            "screens/BorrowLoanTokenScreen",
            "Select Vault"
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
  const bottomSheetLoanTokenList = useMemo(() => {
    return [
      {
        stackScreenName: "LoanTokensList",
        component: BottomSheetLoanTokensList({
          onPress: (loanToken: LoanToken) => {
            setLoanToken(loanToken);
            dismissModal();
          },
          loanTokens,
          isLight,
          onCloseButtonPress: () => dismissModal(),
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
    bottomSheetScreen,
    setBottomSheetScreen,
  } = useBottomSheet();

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
    toast.hideAll();
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max loan amount entered"
      : "{{percent}} of max loan amount entered";
    const toastOption = {
      percent: type,
    };
    toast.show(
      translate("screens/BorrowLoanTokenScreen", toastMessage, toastOption),
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
    if (borrowAmount === undefined || loanTokenPrice === "0") {
      return;
    }
    const annualInterest = interestPerBlock
      .multipliedBy(blocksPerDay * 365)
      .multipliedBy(borrowAmount);
    setTotalAnnualInterest(annualInterest);
  };

  const onSubmit = async (): Promise<void> => {
    if (!formState.isValid || hasPendingJob || hasPendingBroadcastJob) {
      return;
    }

    navigation.navigate({
      name: "ConfirmBorrowLoanTokenScreen",
      params: {
        loanToken: loanToken,
        vault: vault,
        borrowAmount: borrowAmount,
        annualInterest: totalAnnualInterest,
        fee,
        resultingColRatio,
      },
    });
  };

  const validateInput = (): void => {
    if (requiredTokensShare.isZero() || maxLoanAmount.isZero()) {
      setInputValidationMessage({
        message:
          "Insufficient DFI and/or DUSD in vault. Add more to start minting dTokens.",
        type: ValidationMessageType.Error,
      });
    } else if (resultingColRatio.isLessThan(vault.loanScheme.minColRatio)) {
      setInputValidationMessage(undefined); // this error message is moved to below quick input
    } else if (
      resultingColRatio.isLessThan(atRiskThreshold) &&
      new BigNumber(borrowAmount).isGreaterThan(0)
    ) {
      setInputValidationMessage({
        message:
          "Amount entered may liquidate the vault. Proceed at your own risk.",
        type: ValidationMessageType.Warning,
      });
    } else if (isDFILessThanHalfOfRequiredCollateral) {
      setInputValidationMessage({
        message:
          "A minimum of 50% DFI as collateral is required before borrowing DUSD.",
        type: ValidationMessageType.Error,
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
      (v) => v.vaultId === vault.vaultId
    ) as LoanVaultActive;
    setVault(updatedVault);
  }, [vaults]);

  useEffect(() => {
    updateInterestAmount();
    validateInput();
  }, [borrowAmount, vault, loanToken]);

  useEffect(() => {
    setDisableContinue(
      resultingColRatio.isLessThan(vault.loanScheme.minColRatio) ||
        hasPendingJob ||
        hasPendingBroadcastJob ||
        !formState.isValid
    );
  }, [
    resultingColRatio,
    hasPendingJob,
    hasPendingBroadcastJob,
    formState,
    vault,
  ]);

  useEffect(() => {
    const triggerInput = async (): Promise<void> => {
      await trigger("borrowAmount"); // trigger form validation on vault change
    };
    triggerInput();
  }, [vault]);

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
            disabled={maxLoanAmount.isZero()}
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
                      light={tailwind("text-mono-light-v2-900")}
                      dark={tailwind("text-mono-dark-v2-900")}
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
                        isLight ? "mono-light-v2-500" : "mono-dark-v2-500"
                      )}
                      testID="text_input_borrow_amount"
                    />
                  )}
                  rules={{
                    required: true,
                    pattern: /^\d*\.?\d*$/,
                    max: maxLoanAmount.toFixed(8),
                    validate: {
                      greaterThanZero: (value: string) =>
                        new BigNumber(
                          value !== undefined && value !== "" ? value : 0
                        ).isGreaterThan(0),
                      hasDFIandDUSDCollateral: () =>
                        requiredTokensShare.isGreaterThan(0), // need >0 DFI and or DUSD to take loan
                      isDFILessThanHalfOfRequiredCollateral: () =>
                        !isDFILessThanHalfOfRequiredCollateral, // min 50% DFI as collateral if taking DUSD loan
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
                  style={tailwind("text-sm")}
                  testId="borrow_amount_in_usd"
                  containerStyle={tailwind("w-full break-words")}
                />
              </View>

              <TokenDropdownButton
                symbol={loanToken.token.displaySymbol}
                testID="loan_token_dropdown"
                onPress={() => {
                  setBottomSheetScreen(bottomSheetLoanTokenList);
                  expandModal();
                }}
                status={TokenDropdownButtonStatus.Enabled}
              />
            </View>
          </TransactionCard>
          {resultingColRatio.isLessThan(vault.loanScheme.minColRatio) && (
            <ThemedTextV2
              light={tailwind("text-red-v2")}
              dark={tailwind("text-red-v2")}
              style={tailwind("text-xs pt-2 px-5 font-normal-v2")}
              testID="vault_liquidation_error"
            >
              {translate(
                "screens/BorrowLoanTokenScreen",
                "Amount entered will result in vault liquidation"
              )}
            </ThemedTextV2>
          )}
          <VaultInput
            vault={vault}
            onPress={() => {
              setBottomSheetScreen(bottomSheetVaultList);
              expandModal();
            }}
          />

          <TransactionDetailsSection
            vault={vault}
            loanToken={loanToken}
            maxLoanAmount={maxLoanAmount}
            totalAnnualInterest={totalAnnualInterest}
            resultingColRatio={resultingColRatio}
            borrowAmount={borrowAmount}
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
            disableContinue === false && (
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
            )
          )}
          <ButtonV2
            fillType="fill"
            label={translate("components/Button", "Continue")}
            disabled={disableContinue}
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
  vault: LoanVaultActive;
  onPress: () => void;
  testID?: string;
}

function VaultInput(props: VaultInputProps): JSX.Element {
  return (
    <View style={tailwind("")}>
      <ThemedSectionTitleV2
        text={translate("screens/BorrowLoanTokenScreen", "WITH VAULT")}
      />
      <ThemedTouchableOpacityV2
        style={tailwind(
          "py-3.5 px-5 flex-row justify-between items-center rounded-lg-v2"
        )}
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
        onPress={props.onPress}
      >
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
  vault: LoanVaultActive;
  maxLoanAmount: BigNumber;
  loanToken: LoanToken;
  totalAnnualInterest: BigNumber;
  resultingColRatio: BigNumber;
  borrowAmount: string;
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
          value: translate("screens/BorrowLoanTokenScreen", "Max loan amount"),
          testID: "max_loan_amount",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        info={{
          title: translate("screens/BorrowLoanTokenScreen", "Max Loan Amount"),
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
          testID: "price",
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
          value: translate("screens/BorrowLoanTokenScreen", "Annual interest"),
          testID: "total_interest",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        info={{
          title: translate("screens/BorrowLoanTokenScreen", "Annual Interest"),
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
      <CollateralizationRatioDisplayV2
        collateralizationRatio={props.resultingColRatio.toFixed(2)}
        minCollateralizationRatio={props.vault.loanScheme.minColRatio}
        totalLoanAmount={new BigNumber(props.vault.loanValue)
          .plus(
            new BigNumber(props.borrowAmount).isNaN()
              ? new BigNumber(0)
              : new BigNumber(props.borrowAmount)
          )
          .toFixed(8)}
        collateralValue={props.vault.collateralValue}
        testID="borrow_transaction_detail"
        showProgressBar
      />
    </ThemedViewV2>
  );
}
