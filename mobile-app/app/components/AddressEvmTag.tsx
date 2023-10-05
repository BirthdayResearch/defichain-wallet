import { tailwind } from "@tailwind";
import { LinearGradient } from "expo-linear-gradient";

export function AddressEvmTag({
  children,
}: {
  children: React.ReactElement;
}): JSX.Element {
  return (
    <LinearGradient
      colors={["rgba(2, 207, 146, 0.25)", "rgba(59, 87, 207, 0.25)"]}
      start={[0, 0]}
      end={[1, 1]}
      style={tailwind("rounded-lg px-2 py-0.5 ml-1 flex flex-row items-center")}
    >
      {children}
    </LinearGradient>
  );
}
