import { tailwind } from "@tailwind";
import { Text } from "@components/Text";
import { LinearGradient } from "expo-linear-gradient";

export function EvmTag({
  text = "EVM",
  index,
  testIDSuffix,
}: {
  text?: string;
  index: number;
  testIDSuffix: string;
}): JSX.Element {
  return (
    <LinearGradient
      colors={["#42F9C2", "#3B57CF"]}
      start={[0, 0]}
      end={[1, 1]}
      style={tailwind("rounded-sm-v2 px-1.5 py-1 ml-1")}
    >
      <Text
        testID={`address_row_label_${index}_${testIDSuffix}_EVM_tag`}
        style={tailwind(
          "text-mono-light-v2-00 text-2xs font-semibold-v2 leading-3",
        )}
      >
        {text}
      </Text>
    </LinearGradient>
  );
}
