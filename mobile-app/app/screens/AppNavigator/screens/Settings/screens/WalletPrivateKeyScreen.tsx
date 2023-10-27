import { StackScreenProps } from "@react-navigation/stack";
import {
  ThemedScrollViewV2,
  ThemedViewV2,
  ThemedTextV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { SettingsParamList } from "../SettingsNavigator";

type Props = StackScreenProps<SettingsParamList, "WalletPrivateKeyScreen">;

export function WalletPrivateKeyScreen({ route }: Props): JSX.Element {
  const { privateKey } = route.params;

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("pt-8 px-5 pb-16")}
      style={tailwind("flex-1")}
      testID="private_key_screen"
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-base text-center px-5")}
      >
        {translate(
          "screens/WalletPrivateKeyScreen",
          "Never disclose this key. Anyone with your private keys can steal any assets held in your account.",
        )}
      </ThemedTextV2>

      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("rounded-lg-v2 mt-8")}
      >
        {privateKey}
      </ThemedViewV2>
    </ThemedScrollViewV2>
  );
}
