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
import Checkbox from "expo-checkbox";
import { Dispatch, useEffect, useState } from "react";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  hasOceanTXQueued,
  hasTxQueued,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { WalletAlert } from "@components/WalletAlert";
import { ScreenName } from "@screens/enum";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { OCGProposalType } from "@screens/AppNavigator/screens/Portfolio/screens/OCG/OCGProposalsScreen";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { DeFiAddress } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";
import {
  CreateCfp,
  CreateVoc,
} from "@defichain/jellyfish-transaction/dist/script/dftx/dftx_governance";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";

type Props = StackScreenProps<PortfolioParamList, "OCGConfirmScreen">;

export function OCGConfirmScreen({ route }: Props): JSX.Element {
  const {
    type,
    fee,
    proposalFee,
    url,
    title,
    amountRequest,
    cycle,
    receivingAddress,
    conversion,
  } = route.params;
  const isCFPType = type === OCGProposalType.CFP;

  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const logger = useLogger();
  const network = useNetworkContext();
  const dispatch = useAppDispatch();

  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );

  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const [isAcknowledge, setIsAcknowledge] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  async function onSubmit(): Promise<void> {
    if (!isAcknowledge || hasPendingJob || hasPendingBroadcastJob) {
      return;
    }

    const form = {
      networkName: network.networkName,
      isCFPType,
      url,
      title,
      amountRequest,
      cycle,
      receivingAddress,
    };

    setIsSubmitting(true);
    await constructSignedProposalAndSend(
      form,
      dispatch,
      () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch);
      },
      logger
    );
    setIsSubmitting(false);
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
            testID: "proposal_type_label",
          }}
          rhs={{
            value: type,
            themedProps: rhsTheme,
            testID: "proposal_type_value",
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
            testID: "github_label",
          }}
          rhs={{
            value: url,
            themedProps: rhsTheme,
            testID: "github_value",
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
      <FeeSection proposalFee={proposalFee} transactionFee={fee} />
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
        buttonStyle="mx-7 mt-5 mb-2"
        isCancelDisabled={false}
      />
    </ThemedScrollViewV2>
  );
}

function HeaderSection({ title }: { title: string }): JSX.Element {
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
        testID="proposal_title"
      >
        {title}
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
      testID="convert_section"
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
      testID="cfp_section"
    >
      <NumberRowV2
        lhs={{
          testID: "amount_requested",
          value: translate("screens/OCGConfirmScreen", "Amount requested"),
          themedProps: lhsTheme,
        }}
        rhs={{
          testID: "amount_requested_value",
          value: amountRequest?.toFixed(8),
          suffix: " DFI",
          themedProps: rhsTheme,
        }}
      />
      <View style={tailwind("py-5")}>
        <NumberRowV2
          lhs={{
            testID: "cycle",
            value: translate("screens/OCGConfirmScreen", "Cycle(s)"),
            themedProps: lhsTheme,
          }}
          rhs={{
            testID: "cycle_value",
            value: cycle,
            suffix: ` ${translate("screens/OCGConfirmScreen", "Cycle(s)")}`,
            themedProps: rhsTheme,
          }}
        />
      </View>
      <TextRowV2
        lhs={{
          value: translate("screens/OCGConfirmScreen", "Receiving address"),
          themedProps: lhsTheme,
          testID: "receiving_address_label",
        }}
        rhs={{
          value: receivingAddress,
          themedProps: rhsTheme,
          testID: "receiving_address_value",
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
          testID: "proposal_fee_value",
          value: proposalFee?.toFixed(8),
          suffix: " DFI",
          themedProps: rhsTheme,
        }}
        info={{
          title: translate("screens/OCGConfirmScreen", "Proposal Fees"),
          message: translate(
            "screens/OCGConfirmScreen",
            "Proposals fees are implemented to encourage more responsible submissions.\nProposal fees are calculated based on the type of proposal selected, and the requested amount (only for CFP).\nRefer to our FAQ section for more detailed breakdown."
          ),
          iconStyle: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        customSnapPoints={["45%"]}
      />
      <View style={tailwind("pt-5")}>
        <NumberRowV2
          lhs={{
            testID: "transaction_fee",
            value: translate("screens/OCGConfirmScreen", "Transaction fee"),
            themedProps: lhsTheme,
          }}
          rhs={{
            testID: "transaction_fee_value",
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
        testID="switch_ack_proposal"
      />
      <TouchableOpacity
        style={tailwind("flex-1")}
        activeOpacity={0.7}
        onPress={() => {
          onSwitch(!isAcknowledge);
        }}
        testID="button_ack_proposal"
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

interface ProposalForm {
  networkName: NetworkName;
  isCFPType: boolean;
  url: string;
  title: string;
}

interface CFPProposalForm extends ProposalForm {
  amountRequest: BigNumber;
  cycle: number;
  receivingAddress: string;
}

async function constructSignedProposalAndSend(
  form: ProposalForm,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
) {
  try {
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const script = await account.getScript();
      const builder = account.withTransactionBuilder();

      if (form.isCFPType) {
        const cfpForm = form as CFPProposalForm;
        const to = DeFiAddress.from(
          cfpForm.networkName,
          cfpForm.receivingAddress
        ).getScript();
        const cfp: CreateCfp = {
          type: 0x01,
          address: to,
          nAmount: cfpForm.amountRequest,
          nCycles: cfpForm.cycle,
          title: cfpForm.title,
          context: cfpForm.url,
          contexthash: "",
          options: 0x00,
        };
        const signed = await builder.governance.createCfp(cfp, script);
        return new CTransactionSegWit(signed);
      } else {
        const dfip: CreateVoc = {
          type: 0x02,
          title: form.title,
          context: form.url,
          contexthash: "",
          nAmount: new BigNumber(0),
          address: {
            stack: [],
          },
          nCycles: 1,
          options: 0x00,
        };
        const signed = await builder.governance.createVoc(dfip, script);
        return new CTransactionSegWit(signed);
      }
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate("screens/OCGConfirmScreen", "Submitting proposal"),
        drawerMessages: {
          preparing: translate(
            "screens/OCGConfirmScreen",
            "Submitting proposal"
          ),
          waiting: translate("screens/OCGConfirmScreen", "Submitting proposal"),
          complete: translate("screens/OCGConfirmScreen", "Proposal Submitted"),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
