import { TextProps } from "react-native";
import { tailwind } from "@tailwind";
import { ThemedProps } from ".";
import { ThemedText } from "./ThemedText";

type SectionTitleProp = TextProps & ThemedProps & IThemedSectionTitle;

interface IThemedSectionTitle {
  text: string;
}

export function ThemedSectionTitleV2(props: SectionTitleProp): JSX.Element {
  const {
    style = tailwind("px-5 pt-6 pb-2 text-xs font-normal-v2"),
    light = tailwind("text-mono-light-v2-500"),
    dark = tailwind("text-mono-dark-v2-500"),
    ...otherProps
  } = props;

  return (
    <ThemedText dark={dark} light={light} style={style} {...otherProps}>
      {props.text}
    </ThemedText>
  );
}
