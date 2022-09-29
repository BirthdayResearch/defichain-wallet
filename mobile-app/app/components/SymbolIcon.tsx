import { getNativeIcon } from "@components/icons/assets";
import { SvgProps } from "react-native-svg";

export function SymbolIcon(props: {
  symbol: string;
  styleProps?: SvgProps;
}): JSX.Element {
  const Icon = getNativeIcon(props.symbol);
  return <Icon width={16} height={16} {...props.styleProps} />;
}

export function SymbolIconV2(props: {
  symbol: string;
  styleProps?: SvgProps;
}): JSX.Element {
  const Icon = getNativeIcon(props.symbol);
  return <Icon width={24} height={24} {...props.styleProps} />;
}
