import { useStyles } from "@tailwind";
import { ThemedTextV2 } from "@components/themed";
import { View } from "@components";
import { StyleProp, ViewStyle } from "react-native";

interface EmptyBalancesProps {
  icon: () => JSX.Element;
  title: string;
  subtitle: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmptyTokensScreen(props: EmptyBalancesProps): JSX.Element {
  const { icon: Icon, title, subtitle, containerStyle, testID } = props;
  const { tailwind } = useStyles();
  return (
    <View
      style={[
        tailwind("flex px-15 mt-11 mb-4 text-center bg-transparent"),
        containerStyle,
      ]}
      testID={testID}
    >
      <View style={tailwind("items-center")}>
        <Icon />
      </View>
      <ThemedTextV2
        testID="empty_tokens_title"
        style={tailwind("text-xl font-semibold-v2 text-center mt-8")}
      >
        {title}
      </ThemedTextV2>
      <ThemedTextV2
        testID="empty_tokens_subtitle"
        style={tailwind("text-base font-normal-v2 text-center mt-2")}
      >
        {subtitle}
      </ThemedTextV2>
    </View>
  );
}
