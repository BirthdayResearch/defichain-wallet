import { getNativeIcon } from "@components/icons/assets";
import { StyleProp, ViewStyle } from "react-native";
import { EVMLinearGradient } from "@components/EVMLinearGradient";
import { PoolPairIconV2 } from "../../Dex/components/PoolPairCards/PoolPairIconV2";

interface TokenIconProps {
  testID?: string;
  token: {
    isLPS?: boolean;
    displaySymbol: string;
  };
  size: number;
  iconBStyle?: StyleProp<ViewStyle>;
  isEvmToken?: boolean;
}

export function TokenIcon(props: TokenIconProps): JSX.Element {
  const { token, testID, size, iconBStyle, isEvmToken } = props;
  if (token.isLPS === true) {
    const [tokenA, tokenB] = token.displaySymbol.split("-");
    return (
      <PoolPairIconV2
        symbolA={tokenA}
        symbolB={tokenB}
        customSize={size}
        iconBStyle={iconBStyle}
        testID={testID}
      />
    );
  }
  const Icon = getNativeIcon(token.displaySymbol);
  const evmIconSize = isEvmToken ? size - 4 : size;
  return (
    <EVMLinearGradient isEvmToken={isEvmToken}>
      <Icon testID={testID} width={evmIconSize} height={evmIconSize} />
    </EVMLinearGradient>
  );
}
