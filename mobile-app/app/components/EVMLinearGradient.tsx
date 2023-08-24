import { tailwind } from "@tailwind";
import { LinearGradient } from "expo-linear-gradient";
import { ReactElement } from "react";

/* Only apply evm border color if it's an evmtoken */
export function EVMLinearGradient({
  children,
  isEVMtoken,
}: {
  children: ReactElement;
  isEVMtoken?: boolean;
}): JSX.Element | null {
  if (isEVMtoken) {
    return (
      <LinearGradient
        collapsable={false}
        colors={["#02CF92", "#3B57CF"]}
        start={{ x: 0.0, y: 1.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={tailwind("p-0.5 rounded-full")}
      >
        {children}
      </LinearGradient>
    );
  }

  return children;
}
