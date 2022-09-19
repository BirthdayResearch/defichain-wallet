import { ThemedTextV2, ThemedTouchableOpacityV2 } from "@components/themed";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { DexParamList, DexScreenOrigin } from "../DexNavigator";

export function SwapButton(): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  return (
    <ThemedTouchableOpacityV2
      light={tailwind("bg-mono-light-v2-1000")}
      dark={tailwind("bg-mono-dark-v2-1000")}
      style={tailwind("py-2 px-5 rounded-2xl-v2")}
      onPress={() =>
        navigation.navigate({
          name: "CompositeSwap",
          params: { originScreen: DexScreenOrigin.Dex_screen },
          merge: true,
        })
      }
    >
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-100")}
        dark={tailwind("text-mono-dark-v2-100")}
        style={tailwind("font-semibold-v2 text-sm")}
        testID="composite_swap"
      >
        {translate("screens/DexScreen", "Swap")}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}
