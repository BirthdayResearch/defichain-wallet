import { View } from "@components";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableListItem,
  ThemedViewV2,
} from "@components/themed";
import { LoanScheme } from "@defichain/whale-api-client/dist/api/loan";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

import NumberFormat from "react-number-format";

export interface WalletLoanScheme extends LoanScheme {
  disabled?: boolean;
}

interface LoanSchemeOptionsP {
  isLoading: boolean;
  loanSchemes: WalletLoanScheme[];
  selectedLoanScheme?: LoanScheme;
  onLoanSchemePress: (scheme: LoanScheme) => void;
}

export function LoanSchemeOptionsV2(props: LoanSchemeOptionsP): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind("mt-8 mb-1 rounded-t-lg-v2 rounded-b-lg-v2")}
      testID="loan_scheme_options"
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
    >
      {props.isLoading ? (
        <View>
          <SkeletonLoader row={6} screen={SkeletonLoaderScreen.VaultSchemes} />
        </View>
      ) : (
        <View style={tailwind("px-5")}>
          {props.loanSchemes.map((scheme, index) => (
            <ThemedTouchableListItem
              key={scheme.id}
              isLast={index === props.loanSchemes.length - 1}
              styleProps="py-5.5 flex flex-row items-center"
              onPress={() => props.onLoanSchemePress(scheme)}
              disabled={scheme.disabled}
              testID={`loan_scheme_option_${index}`}
            >
              <View style={tailwind("flex-1 flex-col")}>
                <LoanSchemeOptionData
                  label="Collateralization:"
                  value={scheme.minColRatio}
                  testId={`min_col_ratio_value_${index}`}
                  suffix="%"
                  disabled={scheme.disabled}
                />
                <LoanSchemeOptionData
                  label="Vault interest:"
                  value={scheme.interestRate}
                  testId={`interest_rate_value_${index}`}
                  suffix={`% ${translate(
                    "components/LoanSchemeOptions",
                    "APR"
                  )}`}
                  disabled={scheme.disabled}
                  containerStyle="pt-1"
                />
              </View>

              <ThemedViewV2
                light={tailwind("border-mono-light-v2-700", {
                  "border-green-v2 bg-green-v2":
                    props.selectedLoanScheme?.id === scheme.id,
                  "opacity-30": scheme.disabled === true,
                })}
                dark={tailwind("border-mono-dark-v2-700", {
                  "border-green-v2 bg-green-v2":
                    props.selectedLoanScheme?.id === scheme.id,
                  "opacity-30": scheme.disabled === true,
                })}
                style={tailwind(
                  "rounded-full border-1.5 w-6 h-6 items-center justify-center"
                )}
              >
                {props.selectedLoanScheme?.id === scheme.id && (
                  <ThemedIcon
                    iconType="MaterialIcons"
                    name="check"
                    size={22}
                    light={tailwind("text-mono-light-v2-00")}
                    dark={tailwind("text-mono-dark-v2-00")}
                  />
                )}
              </ThemedViewV2>
            </ThemedTouchableListItem>
          ))}
        </View>
      )}
    </ThemedViewV2>
  );
}

function LoanSchemeOptionData(props: {
  label: string;
  value: string;
  testId: string;
  suffix?: string;
  disabled?: boolean;
  containerStyle?: string;
}): JSX.Element {
  return (
    <View style={tailwind("flex-1 flex-row", props.containerStyle)}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700", {
          "text-opacity-30": props.disabled === true,
        })}
        dark={tailwind("text-mono-dark-v2-700", {
          "text-opacity-30": props.disabled === true,
        })}
        style={tailwind("text-sm font-normal-v2")}
      >
        {translate("components/LoanSchemeOptions", props.label)}
      </ThemedTextV2>
      <NumberFormat
        displayType="text"
        suffix={props.suffix}
        renderText={(value: string) => (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-900", {
              "text-opacity-30": props.disabled === true,
            })}
            dark={tailwind("text-mono-dark-v2-900", {
              "text-opacity-30": props.disabled === true,
            })}
            style={tailwind("text-sm font-semibold-v2 pl-1")}
            testID={props.testId}
          >
            {value}
          </ThemedTextV2>
        )}
        thousandSeparator
        value={props.value}
      />
    </View>
  );
}
