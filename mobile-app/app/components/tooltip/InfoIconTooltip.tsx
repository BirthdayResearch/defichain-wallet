import React, { useEffect, useState } from "react";
import { TouchableOpacity, Platform } from "react-native";
import Popover, { PopoverPlacement } from "react-native-popover-view";
import { ThemedIcon, ThemedProps, ThemedText } from "@components/themed";
import { tailwind } from "@tailwind";

interface IconTooltipProps extends ThemedProps {
  size?: number;
  text: string;
}

export function InfoIconTooltip(props: IconTooltipProps): JSX.Element {
  const [showPopover, setShowPopover] = useState(false);

  // to fix memory leak error
  useEffect(() => {
    // May work on Web, but not officially supported, as per documentation, add condition to hide popover/tooltip
    if (Platform.OS === "web") {
      setTimeout(() => setShowPopover(false), 2000);
    }
  }, [showPopover]);

  return (
    <Popover
      placement={PopoverPlacement.AUTO}
      popoverStyle={tailwind("bg-gray-800")}
      isVisible={showPopover}
      onRequestClose={() => setShowPopover(false)}
      from={
        <TouchableOpacity
          onPress={() => setShowPopover(true)}
          testID="info-icon-tooltip"
        >
          <ThemedIcon
            style={tailwind("pl-0.5")}
            size={props.size ?? 12}
            name="info"
            iconType="Feather"
            dark={props.dark ?? tailwind("text-gray-200")}
            light={props.light ?? tailwind("text-gray-700")}
            testID="icon-tooltip"
          />
        </TouchableOpacity>
      }
    >
      <ThemedText
        style={tailwind("py-2 px-3 text-sm")}
        light={tailwind("text-white")}
        dark={tailwind("text-white")}
        testID="info-icon-tooltip-text"
      >
        {props.text}
      </ThemedText>
    </Popover>
  );
}
