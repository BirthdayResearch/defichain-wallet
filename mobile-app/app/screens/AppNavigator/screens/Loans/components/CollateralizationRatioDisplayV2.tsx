import * as Progress from "react-native-progress";
import BigNumber from "bignumber.js";
import { getColor, tailwind } from "@tailwind";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { ThemedTextV2 } from "@components/themed";
import { translate } from "@translations";
import { useCollateralRatioStats } from "@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio";
import { NumericFormat as NumberFormat } from "react-number-format";
import { Text, View } from "react-native";

interface CollateralizationRatioDisplayProps {
  collateralizationRatio: string;
  minCollateralizationRatio: string;
  totalLoanAmount: string;
  testID: string;
  showProgressBar?: boolean;
}

export function CollateralizationRatioDisplayV2(
  props: CollateralizationRatioDisplayProps
): JSX.Element {
  const { isLight } = useThemeContext();
  const atRiskThresholdMultiplier = 1.5;
  const minColRatio = new BigNumber(props.minCollateralizationRatio);
  const maxRatio = getMaxRatio(
    minColRatio.multipliedBy(atRiskThresholdMultiplier)
  );
  // TODO (Harsh) need to check condition when collateralization Ratio goes to -ve and more than maxRatio
  const normalizedNextFactor = new BigNumber(
    props.collateralizationRatio
  ).dividedBy(maxRatio);
  const stats = useCollateralRatioStats({
    colRatio: new BigNumber(props.collateralizationRatio),
    minColRatio: new BigNumber(props.minCollateralizationRatio),
    totalLoanAmount: new BigNumber(props.totalLoanAmount),
  });

  const ratioTextColor = stats.isInLiquidation
    ? "red-v2"
    : stats.isAtRisk
    ? "orange-v2"
    : "green-v2";

  return (
    <View
      testID={`${props.testID}_collateralization_bar`}
    >
      <View style={tailwind("flex-row justify-between")}>
        <View style={tailwind("items-center flex-row")}>
          <ThemedTextV2
            style={tailwind("text-sm font-normal-v2")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
          >
            {translate(
              "components/CollateralizationRatioDisplay",
              "Collateral ratio"
            )}
          </ThemedTextV2>
        </View>
        {new BigNumber(props.collateralizationRatio).isLessThan(0) ? (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-900")}
            dark={tailwind("text-mono-dark-v2-900")}
            style={tailwind("text-sm font-normal-v2")}
          >
            {translate("components/CollateralizationRatioDisplay", "N/A")}
          </ThemedTextV2>
        ) : (
          <NumberFormat
            value={new BigNumber(props.collateralizationRatio).toFixed(2)}
            decimalScale={2}
            thousandSeparator
            displayType="text"
            suffix="%"
            renderText={(value) => (
              <Text
                testID={`${props.testID ?? ""}_col_ratio`}
                style={tailwind(
                  `text-sm font-normal-v2 text-${ratioTextColor}`
                )}
              >
                {value}
              </Text>
            )}
          />
        )}
      </View>
      {props.showProgressBar && (
        <View style={tailwind("mt-3")}>
          <Progress.Bar
            progress={normalizedNextFactor.toNumber()}
            color={getColor(ratioTextColor)}
            unfilledColor={getColor(
              isLight ? "mono-light-v2-200" : "mono-dark-v2-200"
            )}
            height={8}
            borderWidth={0}
            width={null}
          />
        </View>
      )}
    </View>
  );
}

function getMaxRatio(atRiskThreshold: BigNumber): number {
  const healthyScaleRatio = 0.75;
  return atRiskThreshold
    .dividedBy(new BigNumber(1).minus(healthyScaleRatio))
    .toNumber();
}
