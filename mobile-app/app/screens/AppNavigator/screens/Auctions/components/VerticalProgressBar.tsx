import { View } from "@components";
import { memo } from "react";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { getColor, tailwind } from "@tailwind";
import * as Progress from "react-native-progress";

interface VerticalProgressBarProps {
  normalizedBlocks: number;
  height: number;
  color: string;
}

export const VerticalProgressBar = memo(
  (props: VerticalProgressBarProps): JSX.Element => {
    const { isLight } = useThemeContext();

    return (
      <View
        style={[
          tailwind("w-1.5"),
          {
            transform: [{ rotate: "180deg" }],
            height: props.height,
          },
        ]}
      >
        <Progress.Bar
          progress={props.normalizedBlocks}
          style={{
            transform: [
              { translateX: -(props.height / 2 - 2) },
              { translateY: -1 },
              { rotate: "90deg" },
              { translateX: props.height / 2 - 2 },
              { translateY: -1 },
            ],
          }}
          color={getColor(props.color)}
          unfilledColor={getColor(
            isLight ? "mono-light-v2-200" : "mono-dark-v2-200"
          )}
          borderRadius={0}
          borderWidth={0}
          width={props.height}
          height={6}
        />
      </View>
    );
  }
);
