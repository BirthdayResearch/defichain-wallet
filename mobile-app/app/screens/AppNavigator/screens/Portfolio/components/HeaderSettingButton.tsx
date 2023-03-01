import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { getColor } from "@tailwind";
import { TouchableOpacity } from "react-native";
import { SettingsParamList } from "../../Settings/SettingsNavigator";
import { SettingsIcon } from "../assets/SettingsIcon";

export function HeaderSettingButton(): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>();
  const { isLight } = useThemeContext();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("Settings")}
      testID="header_settings"
    >
      <SettingsIcon
        color={getColor(isLight ? "mono-light-v2-900" : "mono-dark-v2-900")}
      />
    </TouchableOpacity>
  );
}
