import { useState } from "react";
import { translate } from "@translations";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { ProposalURLInput } from "@screens/AppNavigator/screens/Portfolio/components/ProposalURLInput";
import { Platform, View } from "react-native";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { ButtonV2 } from "@components/ButtonV2";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { BottomSheetInfoV2 } from "@components/BottomSheetInfoV2";
import { LoanAddRemoveActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";

export function CFPDetailScreen(): JSX.Element {
  const { isLight } = useThemeContext();

  const [isUrlValid, setUrlValid] = useState<boolean>(false);

  function onContinuePress() {}

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("flex-grow px-5 pb-6 justify-between")}
    >
      <View>
        <ProposalURLInput urlValidity={setUrlValid} />
        {isUrlValid && (
          <View style={tailwind("pt-6")}>
            <WalletTextInputV2
              inputType="default"
              title={translate("screens/OCGDetailScreen", "PROPOSAL TITLE")}
              placeholder={translate("screens/OCGDetailScreen", "Title")}
              inputContainerStyle={tailwind("px-5 py-4.5")}
              inlineText={{
                type: "helper",
                text: translate(
                  "screens/OCGDetailScreen",
                  "Make sure this matches the title from Github."
                ),
                style: tailwind("pl-5 text-mono-light-v2-500", {
                  "text-mono-dark-v2-500": !isLight,
                }),
              }}
            />
            <WalletTextInputV2
              inputType="numeric"
              title={translate(
                "screens/OCGDetailScreen",
                "AMOUNT REQUESTED IN DFI"
              )}
              placeholder={translate("screens/OCGDetailScreen", "0.00 DFI")}
              inputContainerStyle={tailwind("px-5 py-4.5")}
              titleStyle={tailwind("pt-4")}
            />
            <VotingCycles />
            <WalletTextInputV2
              inputType="default"
              title={translate("screens/OCGDetailScreen", "RECEIVING ADDRESS")}
              placeholder={translate(
                "screens/OCGDetailScreen",
                "Paste address"
              )}
              inputContainerStyle={tailwind("px-5 py-4.5")}
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
            "Review full proposal details in the next screen"
          )}
        </ThemedTextV2>
        <ButtonV2
          label={translate("screens/OCGDetailScreen", "Continue")}
          styleProps="mt-5 mx-7"
          testID="proposal_continue_button"
          onPress={onContinuePress}
        />
      </View>
    </ThemedScrollViewV2>
  );
}

function VotingCycles(): JSX.Element {
  const [cycle, setCycle] = useState<number>(1);
  const MIN_CYCLE = 1;
  const MAX_CYCLE = 100;

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
          {translate("screens/OCGDetailScreen", "CYCLES")}
        </ThemedTextV2>
        <View
          style={tailwind("ml-1", {
            "mt-0.5": Platform.OS === "android",
          })}
        >
          <BottomSheetInfoV2
            alertInfo={{
              title: translate("screens/OCGDetailScreen", "Voting Cycles"),
              message: translate(
                "screens/OCGDetailScreen",
                "Explain here what voting cycles are and what is it for the users."
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
        inputContainerStyle={tailwind("pl-5 pr-4 py-2.5")}
        value={cycle.toString()}
        onChangeText={(text: string) => setCycle(Number(text))}
      >
        <LoanAddRemoveActionButton
          token="cycle"
          onAdd={() => setCycle(Math.min(cycle + 1, MAX_CYCLE))}
          onRemove={() => setCycle(Math.max(cycle - 1, MIN_CYCLE))}
          leftDisabled={cycle <= MIN_CYCLE}
          rightDisabled={cycle >= MAX_CYCLE}
        />
      </WalletTextInputV2>
    </View>
  );
}
