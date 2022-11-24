import { NavigationProp, useNavigation } from "@react-navigation/native";
import { View } from "@components/index";
import { ThemedScrollViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { ImageBackground } from "react-native";
import { ButtonV2 } from "@components/ButtonV2";
import GridBackgroundImageLight from "@assets/images/onboarding/grid-background-light.png";
import GridBackgroundImageDark from "@assets/images/onboarding/grid-background-dark.png";
import { VersionTag } from "@components/VersionTag";
import { OnboardingCarousel } from "@screens/WalletNavigator/screens/components/OnboardingCarousel";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { WalletParamList } from "../WalletNavigator";

export function Onboarding(): JSX.Element {
  const navigator = useNavigation<NavigationProp<WalletParamList>>();
  const { isLight } = useThemeContext();
  const { top: topInset } = useSafeAreaInsets();
  const logger = useLogger();

  // Hide splashscreen when first page is loaded to prevent white screen
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync().catch(logger.error);
    });
  }, []);

  return (
    <ThemedScrollViewV2
      contentContainerStyle={{ paddingTop: topInset + 88, paddingBottom: 40 }}
      style={tailwind("flex-1")}
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      testID="onboarding_carousel"
    >
      <View style={tailwind("flex-1")}>
        <OnboardingCarousel />
      </View>
      <View>
        <ImageBackground
          source={isLight ? GridBackgroundImageLight : GridBackgroundImageDark}
          style={tailwind("px-8")}
          resizeMode="cover"
        >
          <ButtonV2
            label={translate("screens/Onboarding", "Get started")}
            styleProps="mx-2 mt-20"
            onPress={() => navigator.navigate("CreateWalletGuidelines")}
            testID="get_started_button"
          />
          <ButtonV2
            fillType="flat"
            label={translate("screens/Onboarding", "Restore wallet")}
            styleProps="mx-2 mt-4 mb-11"
            onPress={() => navigator.navigate("RestoreMnemonicWallet")}
            testID="restore_wallet_button"
          />
        </ImageBackground>
        <VersionTag />
      </View>
    </ThemedScrollViewV2>
  );
}
