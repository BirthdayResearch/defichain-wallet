import { ThemedTouchableListItem, ThemedTextV2 } from "@components/themed";
import { StyleProp, TextStyle } from "react-native";
import { useStyles } from "@tailwind";

interface PlaygroundActionProps {
  title: string;
  rhsChildren?: () => JSX.Element;
  isLast: boolean;
  testID?: string;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

export function PlaygroundAction({
  title,
  isLast,
  testID,
  rhsChildren,
  textStyle,
  onPress,
  disabled,
}: PlaygroundActionProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedTouchableListItem
      isLast={isLast}
      testId={testID}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedTextV2 style={[tailwind("text-sm font-normal-v2"), textStyle]}>
        {title}
      </ThemedTextV2>
      {rhsChildren?.()}
    </ThemedTouchableListItem>
  );
}
