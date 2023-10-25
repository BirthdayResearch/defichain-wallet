import { useEffect, useMemo, useState } from "react";
import { translate } from "@translations";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { ProposalURLInput } from "@screens/AppNavigator/screens/Portfolio/components/ProposalURLInput";
import { View } from "react-native";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { ButtonV2 } from "@components/ButtonV2";
import { useNetworkContext, useThemeContext } from "@waveshq/walletkit-ui";
import {
  queueConvertTransaction,
  useConversion,
} from "@hooks/wallet/Conversion";
import BigNumber from "bignumber.js";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  DFITokenSelector,
  DFIUtxoSelector,
  hasOceanTXQueued,
  hasTxQueued,
} from "@waveshq/walletkit-ui/dist/store";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { OCGProposalType } from "@screens/AppNavigator/screens/Portfolio/screens/OCG/OCGProposalsScreen";
import { ConvertDirection } from "@screens/enum";

export function DFIPDetailScreen(): JSX.Element {
  const logger = useLogger();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const { isLight } = useThemeContext();
  const client = useWhaleApiClient();
  const { network } = useNetworkContext();

  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const proposalFee = getDFIPFee(network);

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
      amount: fee.plus(proposalFee),
    },
    deps: [fee, DFIUtxo],
  });

  const [isUrlValid, setUrlValid] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string | undefined>();

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

  function onContinuePress() {
    if (
      !titleStatus.isValidToSubmit ||
      hasPendingJob ||
      hasPendingBroadcastJob
    ) {
      return;
    }

    const params: PortfolioParamList["OCGConfirmScreen"] = {
      type: OCGProposalType.DFIP,
      fee,
      proposalFee,
      url: url,
      title: title!,
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

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("flex-grow px-5 pb-6 justify-between")}
    >
      <View>
        <ProposalURLInput urlValidity={setUrlValid} onChangeUrlInput={setUrl} />
        {isUrlValid && (
          <View style={tailwind("pt-6")} testID="detail_container">
            <WalletTextInputV2
              inputType="default"
              multiline
              testID="input_title"
              title={translate("screens/OCGDetailScreen", "PROPOSAL TITLE")}
              placeholder={translate("screens/OCGDetailScreen", "Title")}
              style={tailwind("w-3/5 flex-grow pb-1 font-normal-v2")}
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
              value={title}
              onChangeText={setTitle}
              displayClearButton={!titleStatus.isEmpty}
              onClearButtonPress={() => setTitle("")}
              valid={!titleStatus.shouldShowError}
            />
          </View>
        )}
      </View>
      <View style={tailwind("justify-center")}>
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
          testID="dfip_continue_button"
          disabled={
            !titleStatus.isValidToSubmit ||
            hasPendingJob ||
            hasPendingBroadcastJob
          }
          onPress={onContinuePress}
        />
      </View>
    </ThemedScrollViewV2>
  );
}

function getDFIPFee(network: EnvironmentNetwork): BigNumber {
  switch (network) {
    case EnvironmentNetwork.MainNet:
    case EnvironmentNetwork.TestNet:
    case EnvironmentNetwork.DevNet:
      return new BigNumber(50);
    default:
      return new BigNumber(5);
  }
}
