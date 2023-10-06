import { tailwind } from "@tailwind";
import { LinearGradient } from "expo-linear-gradient";

export function AddressEvmTag({
  children,
  customStyle,
  testID,
}: {
  children: React.ReactElement;
  customStyle?: string;
  testID: string;
}): JSX.Element {
  return (
    <LinearGradient
      colors={["#02cf9240", "#3b57cf40"]}
      start={[0, 0]}
      end={[1, 1]}
      style={tailwind(
        "rounded-lg px-2 py-0.5 ml-1 flex flex-row items-center",
        customStyle,
      )}
      testID={`${testID}_evm_tag`}
    >
      {children}
    </LinearGradient>
  );
}
