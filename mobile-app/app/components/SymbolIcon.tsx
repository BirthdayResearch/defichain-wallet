import { getNativeIcon } from "@components/icons/assets";
import { SvgProps } from "react-native-svg";

export function SymbolIcon(props: {
  symbol: string;
  styleProps?: SvgProps;
  styleWidth?: number;
  styleHeight?: number;
}): JSX.Element {
  const Icon = getNativeIcon(props.symbol);
  return (
    <Icon
      width={props.styleWidth ?? 16}
      height={props.styleHeight ?? 16}
      {...props.styleProps}
    />
  );
}
