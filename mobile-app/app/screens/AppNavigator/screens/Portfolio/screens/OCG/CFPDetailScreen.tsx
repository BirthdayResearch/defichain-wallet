import { useCallback, useEffect, useMemo, useState } from "react";
import { translate } from "@translations";
import { ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { ProposalURLInput } from "@screens/AppNavigator/screens/Portfolio/components/ProposalURLInput";
import { Platform, View } from "react-native";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { ButtonV2 } from "@components/ButtonV2";
import { useNetworkContext, useThemeContext } from "@waveshq/walletkit-ui";
import { BottomSheetInfoV2 } from "@components/BottomSheetInfoV2";
import { LoanAddRemoveActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";
import { useForm } from "react-hook-form";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import BigNumber from "bignumber.js";
import {
  queueConvertTransaction,
  useConversion,
} from "@hooks/wallet/Conversion";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  hasOceanTXQueued,
  hasTxQueued,
} from "@waveshq/walletkit-ui/dist/store";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { OCGProposalType } from "@screens/AppNavigator/screens/Portfolio/screens/OCG/OCGProposalsScreen";
import { AddressRow } from "@screens/AppNavigator/screens/Portfolio/components/AddressRow";
import { ButtonGroupTabKey } from "@screens/AppNavigator/screens/Portfolio/screens/AddressBookScreen";
import { DomainType } from "@contexts/DomainContext";
import { ConvertDirection } from "@screens/enum";

export function CFPDetailScreen(): JSX.Element {
  const logger = useLogger();
  const dispatch = useAppDispatch();
  const { isLight } = useThemeContext();
  const { networkName } = useNetworkContext();
  const client = useWhaleApiClient();

  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const [amount, setAmount] = useState<string>("");
  const proposalFee = getCFPFee(BigNumber(amount ?? 0));
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const [isUrlValid, setUrlValid] = useState<boolean>(false);

  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet),
  );
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet),
  );
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );

  const { isConversionRequired, conversionAmount } = useConversion({
    inputToken: {
      type: "utxo",
      amount: proposalFee.plus(fee),
    },
    deps: [fee, amount, DFIUtxo],
  });

  // form
  const {
    control,
    setValue,
    getValues,
    trigger,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
  });

  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [cycle, setCycle] = useState<string>("1");
  const [minCycle, maxCycle] = [1, 100];
  const address = getValues("address");

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  const titleStatus = useMemo(() => {
    const isEmpty = title === undefined || title.trim() === "";
    const maxTitleLength = 128;
    return {
      isEmpty: isEmpty,
      isValidToSubmit: !isEmpty && new Blob([title]).size <= maxTitleLength,
      shouldShowError: !isEmpty && new Blob([title]).size > maxTitleLength,
    };
  }, [title]);

  const onAddressSelect = useCallback(
    async (savedAddress: string) => {
      setValue("address", savedAddress, { shouldDirty: true });
      navigation.goBack();
      await trigger("address");
    },
    [navigation],
  );

  function onContinuePress() {
    if (!isButtonEnabled() || hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    const params: PortfolioParamList["OCGConfirmScreen"] = {
      type: OCGProposalType.CFP,
      fee,
      proposalFee,
      url: url,
      title: title,
      amountRequest: BigNumber(amount),
      cycle: Number(cycle),
      receivingAddress: address,
      ...(isConversionRequired && {
        conversion: {
          isConversionRequired,
          DFIToken,
          DFIUtxo,
          conversionAmount,
        },
      }),
    };

    if (isConversionRequired) {
      queueConvertTransaction(
        {
          mode: ConvertDirection.accountToUtxos,
          amount: conversionAmount,
        },
        dispatch,
        () => {
          navigation.navigate("OCGConfirmScreen", params);
        },
        logger,
        () => {
          params.conversion = {
            DFIUtxo,
            DFIToken,
            isConversionRequired: true,
            conversionAmount,
            isConverted: true,
          };
          navigation.navigate({
            name: "OCGConfirmScreen",
            params,
            merge: true,
          });
        },
      );
    } else {
      navigation.navigate("OCGConfirmScreen", params);
    }
  }

  function isFieldEmpty(value: string | undefined): boolean {
    return value === undefined || value.trim() === "";
  }

  function isButtonEnabled(): boolean {
    return (
      !isFieldEmpty(url) &&
      titleStatus.isValidToSubmit &&
      !isFieldEmpty(amount) &&
      BigNumber(cycle).gte(minCycle) &&
      BigNumber(cycle).lte(maxCycle) &&
      isValid
    );
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tailwind("flex-grow px-5 pb-6 justify-between")}
      style={tailwind(
        `${isLight ? "bg-mono-light-v2-100" : "bg-mono-dark-v2-100"}`,
      )}
    >
      <View>
        <ProposalURLInput urlValidity={setUrlValid} onChangeUrlInput={setUrl} />
        {isUrlValid && (
          <View style={tailwind("pt-6")} testID="detail_container">
            <WalletTextInputV2
              inputType="default"
              multiline
              testID="input_title"
              value={title}
              onChangeText={setTitle}
              title={translate("screens/OCGDetailScreen", "PROPOSAL TITLE")}
              placeholder={translate("screens/OCGDetailScreen", "Title")}
              style={tailwind("w-3/5 flex-grow pb-1 font-normal-v2")}
              displayClearButton={!isFieldEmpty(title)}
              onClearButtonPress={() => setTitle("")}
              inlineText={{
                type: titleStatus.shouldShowError ? "error" : "helper",
                text: translate(
                  "screens/OCGDetailScreen",
                  titleStatus.shouldShowError
                    ? "Title exceeds max character limit of 128."
                    : "Make sure that the name added here is the same as from the one posted in GitHub or Reddit.",
                ),
                style: tailwind("pl-5", {
                  "text-red-v2": titleStatus.shouldShowError,
                  "text-mono-light-v2-500":
                    !titleStatus.shouldShowError && isLight,
                  "text-mono-dark-v2-500":
                    !titleStatus.shouldShowError && !isLight,
                }),
              }}
              valid={!titleStatus.shouldShowError}
            />
            <WalletTextInputV2
              inputType="numeric"
              testID="input_amount"
              value={amount}
              onChangeText={setAmount}
              title={translate(
                "screens/OCGDetailScreen",
                "AMOUNT REQUESTED IN DFI",
              )}
              placeholder="0.00 DFI"
              inputContainerStyle={tailwind("py-4.5")}
              titleStyle={tailwind("pt-4")}
              displayClearButton={!isFieldEmpty(amount)}
              onClearButtonPress={() => setAmount("")}
            />
            <VotingCycles
              cycle={cycle}
              setCycle={setCycle}
              minCycle={minCycle}
              maxCycle={maxCycle}
            />
            <AddressRow
              control={control}
              networkName={networkName}
              title={translate("screens/OCGDetailScreen", "RECEIVING ADDRESS")}
              onContactButtonPress={() =>
                navigation.navigate({
                  name: "AddressBookScreen",
                  params: {
                    selectedAddress: getValues("address"),
                    addressDomainType: DomainType.DVM,
                    onAddressSelect,
                    disabledTab: ButtonGroupTabKey.Whitelisted,
                  },
                  merge: true,
                })
              }
              showQrButton={false}
              onClearButtonPress={async () => {
                setValue("address", "");
                await trigger("address");
              }}
              onAddressChange={async (address) => {
                setValue("address", address, { shouldDirty: true });
                await trigger("address");
              }}
              address={address}
              onlyLocalAddress
            />
          </View>
        )}
      </View>
      <View style={tailwind("justify-center pt-6")}>
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-sm px-12 text-center")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {translate(
            "screens/OCGDetailScreen",
            "Review full proposal details in the next screen",
          )}
        </ThemedTextV2>
        <ButtonV2
          label={translate("screens/OCGDetailScreen", "Continue")}
          styleProps="mt-5 mx-7"
          testID="cfp_continue_button"
          onPress={onContinuePress}
          disabled={
            !isButtonEnabled() || hasPendingJob || hasPendingBroadcastJob
          }
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

function VotingCycles({
  cycle,
  setCycle,
  minCycle,
  maxCycle,
}: {
  cycle: string;
  setCycle: (cycle: string) => void;
  minCycle: number;
  maxCycle: number;
}): JSX.Element {
  return (
    <View>
      <View
        style={tailwind("flex-row items-center justify-start pt-4 pl-5 pb-2")}
      >
        <ThemedTextV2
          style={tailwind("text-xs font-normal-v2")}
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
        >
          {translate("screens/OCGDetailScreen", "CYCLE(S)")}
        </ThemedTextV2>
        <View
          style={tailwind("ml-1", {
            "mt-0.5": Platform.OS === "android",
          })}
        >
          <BottomSheetInfoV2
            alertInfo={{
              title: translate("screens/OCGDetailScreen", "Voting Cycle(s)"),
              message: translate(
                "screens/OCGDetailScreen",
                "Cycle(s) determine the duration for which a proposal can accept votes.",
              ),
            }}
            name="voting_cycles"
            infoIconStyle={{
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            }}
          />
        </View>
      </View>
      <WalletTextInputV2
        inputType="number-pad"
        testID="input_cycle"
        inputContainerStyle={tailwind("pl-5 pr-4 py-2.5")}
        value={cycle.toString()}
        onChangeText={setCycle}
        valid={
          Number(cycle) >= minCycle &&
          Number(cycle) <= maxCycle &&
          Number.isInteger(Number(cycle))
        }
        inlineText={{
          type: "error",
          text: translate(
            "screens/OCGDetailScreen",
            "Cycle(s) should be 1-100 only",
          ),
          style: tailwind("pl-5"),
        }}
      >
        <LoanAddRemoveActionButton
          token="cycle"
          onAdd={() =>
            setCycle(
              Math.min(Math.floor(Number(cycle) + 1), maxCycle).toString(),
            )
          }
          onRemove={() =>
            setCycle(
              Math.max(Math.floor(Number(cycle) - 1), minCycle).toString(),
            )
          }
          leftDisabled={Number(cycle) <= minCycle}
          rightDisabled={Number(cycle) >= maxCycle}
        />
      </WalletTextInputV2>
    </View>
  );
}

function getCFPFee(requestedAmount?: BigNumber): BigNumber {
  const CFP_MIN_FEE = 10;
  const amount = requestedAmount ?? new BigNumber(0);
  return new BigNumber(
    Math.max(amount.multipliedBy(0.01).toNumber(), CFP_MIN_FEE),
  );
}
