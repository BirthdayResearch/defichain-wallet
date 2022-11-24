import { translate } from "@translations";

import { StyleProp, ViewStyle } from "react-native";
import { InfoText, InfoTextV2 } from "./InfoText";

interface ReservedDFIInfoTextProps {
  style?: StyleProp<ViewStyle>;
}

export function ReservedDFIInfoText(
  props: ReservedDFIInfoTextProps
): JSX.Element {
  return (
    <InfoText
      testID="reserved_info_text"
      text={translate(
        "components/ReservedDFIInfoText",
        "A small UTXO amount (0.1 DFI) is reserved for fees."
      )}
      style={props.style}
    />
  );
}

export function ReservedDFIInfoTextV2(
  props: ReservedDFIInfoTextProps
): JSX.Element {
  return (
    <InfoTextV2
      testID="reserved_info_text"
      text={translate(
        "components/ReservedDFIInfoText",
        "A small UTXO amount (0.1 DFI) is reserved for fees."
      )}
      style={props.style}
    />
  );
}
