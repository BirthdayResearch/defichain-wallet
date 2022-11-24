import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { View } from "@components/index";
import { PinTextInputV2 } from "@components/PinTextInputV2";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { LearnMoreCTA } from "@screens/WalletNavigator/screens/components/LearnModeCTA";
import { SettingsParamList } from "../SettingsNavigator";

type Props = StackScreenProps<SettingsParamList, "ChangePinScreen">;

export function ChangePinScreen({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>();
  const { pinLength, words } = route.params;
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    if (newPin.length !== pinLength) {
      return;
    }

    setNewPin("");
    navigation.navigate({
      name: "ConfirmPinScreen",
      params: { words, pin: newPin },
      merge: true,
    });
  }, [newPin]);

  const goToPasscodeFaq = (): void => {
    navigation.navigate("PasscodeFaq");
  };

  return (
    <ThemedScrollViewV2
      style={tailwind("w-full flex-1 flex-col")}
      testID="screen_create_pin"
    >
      <View style={tailwind("px-10 my-12")}>
        <ThemedTextV2 style={tailwind("text-center font-normal-v2")}>
          {translate(
            "screens/ChangePinScreen",
            "Keep the passcode for your wallet confidential."
          )}
        </ThemedTextV2>
        <LearnMoreCTA onPress={goToPasscodeFaq} testId="passcode_faq_link" />
      </View>
      <PinTextInputV2
        cellCount={6}
        onChange={setNewPin}
        testID="pin_input"
        value={newPin}
      />
      <View style={tailwind("mt-5 px-12")}>
        <ThemedTextV2
          style={tailwind("text-center text-sm font-normal-v2")}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
        >
          {translate("screens/PinCreation", "Create new passcode")}
        </ThemedTextV2>
      </View>
    </ThemedScrollViewV2>
  );
}
