import { useState } from "react";
import { translate } from "@translations";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { ProposalURLInput } from "@screens/AppNavigator/screens/Portfolio/components/ProposalURLInput";
import { View } from "react-native";
import { WalletTextInputV2 } from "@components/WalletTextInputV2";
import { ButtonV2 } from "@components/ButtonV2";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { useConversion } from "@hooks/wallet/Conversion";
import BigNumber from "bignumber.js";

export function DFIPDetailScreen(): JSX.Element {
  const { isLight } = useThemeContext();

  const { isConversionRequired } = useConversion({
    inputToken: {
      type: "utxo",
      amount: new BigNumber(0.05),
    },
  });

  const [isUrlValid, setUrlValid] = useState<boolean>(false);
  const [title, setTitle] = useState<string | undefined>();
  const isTitleEmpty = title === undefined || title.trim() === "";

  function onContinuePress() {
    if (isTitleEmpty) {
      return;
    }

    if (isConversionRequired) {
      // todo convert and navigate
    } else {
      // todo navigate
    }
  }

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
              multiline
              testID="input_title"
              title={translate("screens/OCGDetailScreen", "PROPOSAL TITLE")}
              placeholder={translate("screens/OCGDetailScreen", "Title")}
              style={tailwind("w-3/5 flex-grow pb-1 font-normal-v2")}
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
              value={title}
              onChangeText={setTitle}
              displayClearButton={!isTitleEmpty}
              onClearButtonPress={() => setTitle("")}
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
            "Review full proposal details in the next screen"
          )}
        </ThemedTextV2>
        <ButtonV2
          label={translate("screens/OCGDetailScreen", "Continue")}
          styleProps="mt-5 mx-7"
          testID="proposal_continue_button"
          disabled={isTitleEmpty}
          onPress={onContinuePress}
        />
      </View>
    </ThemedScrollViewV2>
  );
}
