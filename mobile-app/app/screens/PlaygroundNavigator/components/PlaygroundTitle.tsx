import { View } from "@components/index";
import { ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { PlaygroundStatus, PlaygroundStatusProps } from "./PlaygroundStatus";

interface PlaygroundTitleProps {
  title: string;
  status: PlaygroundStatusProps;
}

export function PlaygroundTitle(props: PlaygroundTitleProps): JSX.Element {
  return (
    <View
      style={tailwind(
        "px-5 mb-2 mt-6 flex-row flex items-center justify-between"
      )}
    >
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-500")}
        light={tailwind("text-mono-light-v2-500")}
        style={tailwind("font-normal-v2 text-xs")}
      >
        {props.title}
      </ThemedTextV2>

      <PlaygroundStatus {...props.status} />
    </View>
  );
}
