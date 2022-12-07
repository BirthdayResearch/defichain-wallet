import { Feather } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { useState } from "react";
import * as React from "react";
import { View, Image } from "react-native";
import Checkbox from "expo-checkbox";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import DarkNewWallet from "@assets/images/dark-wallet-guidelines.png";
import LightNewWallet from "@assets/images/light-wallet-guidelines.png";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { ButtonV2 } from "@components/ButtonV2";
import { WalletParamList } from "../../WalletNavigator";
import { LearnMoreCTA } from "../components/LearnModeCTA";

type Props = StackScreenProps<WalletParamList, "CreateWalletGuidelines">;

interface GuidelineItem {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
}

const guidelines: GuidelineItem[] = [
  {
    title:
      "Write the words on paper. Take note of their correct spelling and order.",
    icon: "edit-2",
  },
  {
    title:
      "Secure them in a safe place. Store them offline at a place only you have access. Keep them private and do not share it with anyone.",
    icon: "lock",
  },
];

export function CreateWalletGuidelines({ navigation }: Props): JSX.Element {
  const { tailwind, getColor } = useStyles();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = (): void =>
    setIsEnabled((previousState) => !previousState);
  const { isLight } = useThemeContext();

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("pt-12 px-5 pb-16")}
      style={tailwind("flex-1")}
    >
      <View style={tailwind("flex flex-row justify-center")}>
        <Image
          style={{ width: 200, height: 136 }}
          source={isLight ? LightNewWallet : DarkNewWallet}
        />
      </View>
      <ThemedTextV2
        style={tailwind("mt-7 px-3 text-base font-normal-v2 text-center")}
      >
        {translate(
          "screens/Guidelines",
          "You will be shown 24 recovery words on the next screen. Keep your 24-word recovery safe as it will allow you to recover access to the wallet."
        )}
      </ThemedTextV2>
      <LearnMoreCTA
        onPress={() => navigation.navigate("RecoveryWordsFaq")}
        testId="recovery_words_faq"
      />
      <View style={tailwind("px-6 mt-12")}>
        {guidelines.map((g, i) => (
          <View key={i} style={tailwind("flex flex-row items-start my-3")}>
            <ThemedViewV2
              light={tailwind("bg-mono-light-v2-700")}
              dark={tailwind("bg-mono-dark-v2-700")}
              style={tailwind(
                "flex h-6 w-6 flex-row items-center justify-center rounded-full mt-1"
              )}
            >
              <ThemedIcon
                light={tailwind("text-mono-light-v2-100")}
                dark={tailwind("text-mono-dark-v2-100")}
                iconType="Feather"
                name={g.icon}
                size={14}
              />
            </ThemedViewV2>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("flex-1 text-xs ml-4 font-normal-v2")}
            >
              {translate("screens/Guidelines", g.title)}
            </ThemedTextV2>
          </View>
        ))}
        <View style={tailwind("mt-3 flex flex-row items-start")}>
          <Checkbox
            value={isEnabled}
            onValueChange={toggleSwitch}
            style={tailwind("h-6 w-6 mt-1 rounded")}
            color={isEnabled ? getColor("brand-v2-500") : undefined}
            testID="guidelines_check"
          />
          <ThemedTouchableOpacityV2
            light={tailwind("border-b-0")}
            dark={tailwind("border-b-0")}
            style={tailwind("flex-1")}
            onPress={toggleSwitch}
          >
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("text-xs ml-4 font-normal-v2")}
            >
              {translate(
                "screens/Guidelines",
                "I understand it is my responsibility to keep my recovery words secure. Losing them will result in the irrecoverable loss of access to my wallet funds."
              )}
            </ThemedTextV2>
          </ThemedTouchableOpacityV2>
        </View>
      </View>
      <ButtonV2
        disabled={!isEnabled}
        style={tailwind("rounded")}
        label={translate("screens/Guidelines", "Create wallet")}
        styleProps="mt-12 mx-7"
        onPress={() => navigation.navigate("CreateMnemonicWallet")}
        testID="create_recovery_words_button"
      />
    </ThemedScrollViewV2>
  );
}
