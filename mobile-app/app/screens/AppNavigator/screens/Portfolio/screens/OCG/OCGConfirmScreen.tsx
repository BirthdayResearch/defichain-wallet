import { StackScreenProps } from "@react-navigation/stack";
import {
  ConversionParam,
  PortfolioParamList,
} from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { TextRowV2 } from "@components/TextRowV2";
import { TouchableOpacity, View } from "react-native";
import { NumberRowV2 } from "@components/NumberRowV2";
import BigNumber from "bignumber.js";
import { OCGProposalType } from "@screens/AppNavigator/screens/Portfolio/screens/OCG/OCGProposalsScreen";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  hasOceanTXQueued,
  hasTxQueued,
} from "@waveshq/walletkit-ui/dist/store";
import { WalletAlert } from "@components/WalletAlert";
import { ScreenName } from "@screens/enum";
import { NavigationProp, useNavigation } from "@react-navigation/native";

type Props = StackScreenProps<PortfolioParamList, "OCGConfirmScreen">;

export function OCGConfirmScreen({ route }: Props): JSX.Element {
  const {
    type,
    url,
    title,
    amountRequest,
    cycle,
    receivingAddress,
    conversion,
  } = route.params;
  const isCFPType = type === OCGProposalType.CFP;

  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();

  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );

  const [isAcknowledge, setIsAcknowledge] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    if (!isAcknowledge || hasPendingJob || hasPendingBroadcastJob) {
      return null;
    }

    setIsSubmitting(true);
  }

  function onCancel() {
    if (isSubmitting) {
      return;
    }

    WalletAlert({
      title: translate("screens/Settings", "Cancel transaction"),
      message: translate(
        "screens/Settings",
        "By cancelling, you will lose any changes you made for your transaction."
      ),
      buttons: [
        {
          text: translate("screens/Settings", "Go back"),
          style: "cancel",
        },
        {
          text: translate("screens/Settings", "Cancel"),
          style: "destructive",
          onPress: async () => {
            navigation.navigate(ScreenName.PORTFOLIO_screen);
          },
        },
      ],
    });
  }

  return (
    <ThemedScrollViewV2 contentContainerStyle={tailwind("py-8 px-5")}>
      <HeaderSection title={title} />
      {conversion !== undefined && conversion.isConversionRequired && (
        <ConversionSection conversion={conversion} />
      )}
      <ThemedViewV2
        style={tailwind("pt-5 border-t-0.5 ")}
        light={tailwind("text-mono-light-v2-900 border-mono-light-v2-300")}
        dark={tailwind("text-mono-dark-v2-900 border-mono-dark-v2-300")}
      >
        <TextRowV2
          lhs={{
            value: translate("screens/OCGConfirmScreen", "Proposal type"),
            themedProps: lhsTheme,
          }}
          rhs={{
            value: type,
            themedProps: rhsTheme,
          }}
        />
      </ThemedViewV2>
      <ThemedViewV2
        style={tailwind("py-5 border-b-0.5")}
        light={tailwind("border-mono-light-v2-300")}
        dark={tailwind("border-mono-dark-v2-300")}
      >
        <TextRowV2
          lhs={{
            value: "Github",
            themedProps: lhsTheme,
          }}
          rhs={{
            value: url,
            themedProps: rhsTheme,
          }}
        />
      </ThemedViewV2>
      {isCFPType &&
        amountRequest !== undefined &&
        cycle !== undefined &&
        receivingAddress !== undefined && (
          <CFPSection
            amountRequest={amountRequest}
            cycle={cycle}
            receivingAddress={receivingAddress}
          />
        )}
      <FeeSection
        proposalFee={BigNumber(150)}
        transactionFee={BigNumber(0.05)}
      />
      <AcknowledgeSwitch
        isAcknowledge={isAcknowledge}
        onSwitch={setIsAcknowledge}
      />
      <SubmitButtonGroup
        isDisabled={!isAcknowledge || hasPendingJob || hasPendingBroadcastJob}
        title="submit"
        label={translate("screens/OCGConfirmScreen", "Submit")}
        displayCancelBtn
        onSubmit={onSubmit}
        onCancel={onCancel}
        buttonStyle="mx-7 mt-5"
        isCancelDisabled={false}
      />
    </ThemedScrollViewV2>
  );
}

function HeaderSection({ title }: { title: string }): JSX.Element {
  function getFormattedTitle() {
    const index = title.indexOf(":");
    const titleFirst = title.substring(0, index).trim();
    const titleLast = title.substring(index + 1).trim();
    return `${titleFirst}:\n${titleLast}`;
  }

  return (
    <View>
      <ThemedTextV2
        style={tailwind("text-xs font-normal-v2")}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
      >
        {translate("screens/OCGConfirmScreen", "You are proposing")}
      </ThemedTextV2>
      <ThemedTextV2
        style={tailwind("text-xl font-semibold-v2 mt-2 pb-8")}
        light={tailwind("text-mono-light-v2-900")}
        dark={tailwind("text-mono-dark-v2-900")}
      >
        {getFormattedTitle()}
      </ThemedTextV2>
    </View>
  );
}

function ConversionSection({
  conversion,
}: {
  conversion: ConversionParam;
}): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind("py-5 border-t-0.5")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <NumberRowV2
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent"),
        }}
        lhs={{
          value: translate("screens/OCGConfirmScreen", "Amount to convert"),
          testID: "amount_to_convert",
          themedProps: lhsTheme,
        }}
        rhs={{
          value: conversion.conversionAmount.toFixed(8),
          suffix: " DFI",
          testID: "amount_to_convert_value",
          themedProps: rhsTheme,
          isConverting: !conversion.isConverted,
        }}
      />
    </ThemedViewV2>
  );
}

function CFPSection({
  amountRequest,
  cycle,
  receivingAddress,
}: {
  amountRequest: BigNumber;
  cycle: number;
  receivingAddress: string;
}) {
  return (
    <ThemedViewV2
      style={tailwind("py-4 border-b-0.5")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <NumberRowV2
        lhs={{
          testID: "amount_requested",
          value: translate("screens/OCGConfirmScreen", "Amount requested"),
          themedProps: lhsTheme,
        }}
        rhs={{
          testID: "amount_requested",
          value: amountRequest?.toFixed(8),
          suffix: " DFI",
          themedProps: rhsTheme,
        }}
      />
      <View style={tailwind("py-5")}>
        <NumberRowV2
          lhs={{
            testID: "cycle",
            value: translate("screens/OCGConfirmScreen", "Cycle"),
            themedProps: lhsTheme,
          }}
          rhs={{
            testID: "cycle",
            value: cycle,
            suffix: ` ${translate("screens/OCGConfirmScreen", "Cycle")}`,
            themedProps: rhsTheme,
          }}
        />
      </View>
      <TextRowV2
        lhs={{
          value: translate("screens/OCGConfirmScreen", "Receiving address"),
          themedProps: lhsTheme,
        }}
        rhs={{
          value: receivingAddress,
          themedProps: rhsTheme,
        }}
      />
    </ThemedViewV2>
  );
}

function FeeSection({
  proposalFee,
  transactionFee,
}: {
  proposalFee: BigNumber;
  transactionFee: BigNumber;
}): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind("py-4 border-b-0.5")}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <NumberRowV2
        lhs={{
          testID: "proposal_fee",
          value: translate("screens/OCGConfirmScreen", "Proposal fee"),
          themedProps: lhsTheme,
        }}
        rhs={{
          testID: "proposal_fee",
          value: proposalFee?.toFixed(8),
          suffix: " DFI",
          themedProps: rhsTheme,
        }}
        info={{
          title: translate("screens/OCGConfirmScreen", "Proposal fee"),
          message: translate("screens/OCGConfirmScreen", "-"),
          iconStyle: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
      />
      <View style={tailwind("pt-5")}>
        <NumberRowV2
          lhs={{
            testID: "transaction_fee",
            value: translate("screens/OCGConfirmScreen", "Transaction fee"),
            themedProps: lhsTheme,
          }}
          rhs={{
            testID: "transaction_fee",
            value: transactionFee?.toFixed(8),
            suffix: " DFI",
            themedProps: rhsTheme,
          }}
        />
      </View>
    </ThemedViewV2>
  );
}

function AcknowledgeSwitch({
  isAcknowledge,
  onSwitch,
}: {
  isAcknowledge: boolean;
  onSwitch: (val: boolean) => void;
}): JSX.Element {
  return (
    <View style={tailwind("px-7 pt-16 flex flex-row justify-center")}>
      <Checkbox
        value={isAcknowledge}
        style={tailwind("h-6 w-6 mt-1 rounded")}
        onValueChange={onSwitch}
        color={isAcknowledge ? getColor("brand-v2-500") : undefined}
        testID="lp_ack_switch"
      />
      <TouchableOpacity
        style={tailwind("flex-1")}
        activeOpacity={0.7}
        onPress={() => {
          onSwitch(!isAcknowledge);
        }}
      >
        <ThemedTextV2
          style={tailwind("ml-4 flex-1 text-xs font-normal-v2")}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
        >
          {translate(
            "screens/OCGConfirmScreen",
            "I acknowledge all proposal details to be correct and final. Once submitted, the proposal is no longer editable. View your posted proposal in DeFiScan."
          )}
        </ThemedTextV2>
      </TouchableOpacity>
    </View>
  );
}

const lhsTheme = {
  light: tailwind("text-mono-light-v2-500"),
  dark: tailwind("text-mono-dark-v2-500"),
};

const rhsTheme = {
  light: tailwind("text-mono-light-v2-900"),
  dark: tailwind("text-mono-dark-v2-900"),
};
