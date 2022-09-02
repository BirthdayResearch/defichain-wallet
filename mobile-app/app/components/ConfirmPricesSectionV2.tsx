import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { StyleProp, TextStyle } from "react-native";
import { NumberRowV2 } from "./NumberRowV2";

export interface PriceRateV2Props {
  label: string;
  value: string;
  aSymbol: string;
  bSymbol: string;
  usdTextStyle?: StyleProp<TextStyle>;
}

export function ConfirmPricesSectionV2({
  priceRates,
  testID,
}: {
  priceRates: PriceRateV2Props[];
  testID: string;
  sectionTitle?: string;
}): JSX.Element {
  const rowStyle = {
    lhsThemedProps: {
      light: tailwind("text-mono-light-v2-500"),
      dark: tailwind("text-mono-dark-v2-500"),
    },
    rhsThemedProps: {
      light: tailwind("text-mono-light-v2-900"),
      dark: tailwind("text-mono-dark-v2-900"),
    },
  };

  return (
    <>
      {priceRates.map((priceRate, index) => {
        return (
          <NumberRowV2
            key={priceRate.label}
            lhs={{
              value: `${priceRate.label}`,
              testID: `${testID}_${index}`,
              suffix: priceRate.bSymbol,
              themedProps: {
                light: rowStyle.lhsThemedProps.light,
                dark: rowStyle.lhsThemedProps.dark,
              },
            }}
            rhs={{
              value: priceRate.value,
              testID: `${testID}_${index}`,
              suffix: priceRate.bSymbol != null ? ` ${priceRate.bSymbol}` : "",
              usdAmount: new BigNumber(priceRate.value),
              themedProps: {
                light: rowStyle.rhsThemedProps.light,
                dark: rowStyle.rhsThemedProps.dark,
              },
              usdTextStyle: priceRate.usdTextStyle,
            }}
          />
        );
      })}
    </>
  );
}
