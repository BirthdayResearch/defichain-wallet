import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useStyles } from "@tailwind";
import { TouchableOpacity } from "react-native";
import { SettingsParamList } from "../../Settings/SettingsNavigator";
import { SettingsIcon } from "../assets/SettingsIcon";

export function HeaderSettingButton(): JSX.Element {
  const { getColor } = useStyles();
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
