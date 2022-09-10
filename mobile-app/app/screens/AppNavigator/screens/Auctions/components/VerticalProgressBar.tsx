import { View } from "@components";
import { memo, useState } from "react";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { getColor, tailwind } from "@tailwind";
import * as Progress from "react-native-progress";
import { LayoutChangeEvent } from "react-native";

interface VerticalProgressBarProps {
  normalizedBlocks: number;
  color: string;
}

export const VerticalProgressBar = memo(
  (props: VerticalProgressBarProps): JSX.Element => {
    const { isLight } = useThemeContext();
    const [progressBarHeight, setProgressBarHeight] = useState<number>(0);

    const onPageLayout = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setProgressBarHeight(height);
    };

    return (
      <View
        onLayout={onPageLayout}
        style={[
          tailwind("w-1.5 h-full"),
          {
            transform: [{ rotate: "180deg" }],
          },
        ]}
      >
        <Progress.Bar
          progress={props.normalizedBlocks}
          style={{
            transform: [
              { translateX: -(progressBarHeight / 2 - 2) },
              { translateY: -1 },
              { rotate: "90deg" },
              { translateX: progressBarHeight / 2 - 2 },
              { translateY: -1 },
            ],
          }}
          color={getColor(props.color)}
          unfilledColor={getColor(
            isLight ? "mono-light-v2-00" : "mono-dark-v2-00"
          )}
          borderRadius={0}
          borderWidth={0}
          width={progressBarHeight}
          height={6}
        />
      </View>
    );
  }
);
