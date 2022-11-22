import { useStyles } from "@tailwind";
import { nativeApplicationVersion } from "expo-application";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { translate } from "@translations";

export function VersionTag(): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      light={tailwind("bg-transparent")}
      dark={tailwind("bg-transparent")}
    >
      <ThemedTextV2
        style={tailwind("text-2xs font-normal-v2 text-center")}
        testID="version_tag"
      >
        {translate("components/VersionTag", "VERSION {{number}}", {
          number: nativeApplicationVersion ?? "0.0.0",
        })}
      </ThemedTextV2>
    </ThemedViewV2>
  );
}
