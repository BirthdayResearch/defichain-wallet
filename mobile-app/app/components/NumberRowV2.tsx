import {
  Platform,
  StyleProp,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import { useStyles } from "@tailwind";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";
import { translate } from "@translations";
import {
  ThemedActivityIndicatorV2,
  ThemedIcon,
  ThemedProps,
  ThemedTextV2,
  ThemedViewV2,
} from "./themed";
import { IconTooltip } from "./tooltip/IconTooltip";
import { BottomSheetAlertInfoV2, BottomSheetInfoV2 } from "./BottomSheetInfoV2";
import { SymbolIcon } from "./SymbolIcon";

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowProps;

interface NumberRowProps extends ThemedProps {
  lhs: NumberRowElement;
  rhs: RhsNumberRowElement;
  info?: BottomSheetAlertInfoV2 & { iconStyle?: ThemedProps };
  containerStyle?: ThemedProps & { style: ThemedProps & StyleProp<ViewStyle> };
  customSnapPoints?: string[];
}

export interface RhsNumberRowElement extends NumberRowElement {
  usdAmount?: BigNumber;
  isOraclePrice?: boolean;
  textStyle?: StyleProp<TextStyle>;
  usdContainerStyle?: StyleProp<ViewStyle>;
  usdTextStyle?: StyleProp<TextStyle>;
  subValue?: NumberRowElement;
  isConverting?: boolean;
  prefixSymbol?: string;
}

export interface NumberRowElement {
  value: string | number;
  prefix?: string;
  suffix?: string;
  testID: string;
  themedProps?: ThemedProps & { style?: ThemedProps & StyleProp<ViewStyle> };
  outerContainerStyle?: StyleProp<ViewStyle>;
}

export function NumberRowV2(props: INumberRowProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      style={
        props.containerStyle?.style ??
        tailwind("flex-row items-start w-full bg-transparent")
      }
      light={props.containerStyle?.light ?? tailwind("bg-transparent")}
      dark={props.containerStyle?.dark ?? tailwind("bg-transparent")}
    >
      <View style={[tailwind("w-5/12"), props.lhs.outerContainerStyle]}>
        <View style={tailwind("flex-row items-center justify-start")}>
          <ThemedTextV2
            style={tailwind("text-sm font-normal-v2")}
            testID={`${props.lhs.testID}_label`}
            {...props.lhs.themedProps}
          >
            {props.lhs.value}
          </ThemedTextV2>
          {props.info != null && (
            <View
              style={tailwind("ml-1", { "mt-0.5": Platform.OS === "android" })}
            >
              <BottomSheetInfoV2
                alertInfo={props.info}
                name={props.info.title}
                infoIconStyle={props.info.iconStyle}
                snapPoints={props.customSnapPoints ?? ["40%"]}
              />
            </View>
          )}
        </View>
      </View>

      <View style={[tailwind("flex-1"), props.rhs.outerContainerStyle]}>
        <View>
          <View
            style={tailwind("flex flex-row justify-end flex-wrap items-center")}
          >
            {props.rhs.prefixSymbol && (
              <View style={tailwind("pr-2")}>
                <SymbolIcon
                  symbol={props.rhs.prefixSymbol}
                  styleProps={tailwind("w-6 h-6")}
                />
              </View>
            )}
            <NumberFormat
              decimalScale={8}
              displayType="text"
              prefix={props.rhs.prefix}
              suffix={
                props.rhs.suffix !== undefined
                  ? `${props.rhs.suffix}`
                  : undefined
              }
              renderText={(val: string) => (
                <ThemedTextV2
                  style={[
                    tailwind("text-right font-normal-v2 text-sm"),
                    props.rhs.textStyle,
                  ]}
                  testID={props.rhs.testID}
                  {...props.rhs.themedProps}
                >
                  {val}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={props.rhs.value}
            />
          </View>
        </View>
        <View
          style={tailwind("flex flex-row justify-end flex-wrap items-center")}
        >
          {props.rhs.usdAmount !== undefined && (
            <ActiveUSDValueV2
              price={props.rhs.usdAmount}
              containerStyle={[
                tailwind("justify-end pb-5"),
                props.rhs.usdContainerStyle,
              ]}
              testId={`${props.rhs.testID}_rhsUsdAmount`}
              style={props.rhs.usdTextStyle}
            />
          )}
          {props.rhs.isOraclePrice === true && <IconTooltip />}
          {props.rhs.subValue !== undefined && (
            <NumberFormat
              decimalScale={8}
              displayType="text"
              prefix={props.rhs.subValue.prefix}
              suffix={props.rhs.subValue.suffix}
              renderText={(val: string) => (
                <ThemedTextV2
                  style={tailwind("text-right font-normal-v2 text-sm mt-1")}
                  light={tailwind("text-mono-light-v2-700")}
                  dark={tailwind("text-mono-dark-v2-700")}
                  testID={props.rhs.subValue?.testID}
                  {...props.rhs.subValue?.themedProps}
                >
                  {val}
                </ThemedTextV2>
              )}
              thousandSeparator
              value={props.rhs.subValue.value}
            />
          )}
          {props.rhs.isConverting !== undefined && (
            <View
              style={tailwind(
                "flex flex-row text-right items-center justify-end pt-1"
              )}
            >
              <ThemedTextV2
                style={tailwind("mr-1.5 text-sm font-normal-v2")}
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
                testID="conversion_status"
              >
                {translate(
                  "screens/common",
                  props.rhs.isConverting ? "Converting" : "Converted"
                )}
              </ThemedTextV2>
              {props.rhs.isConverting ? (
                <ThemedActivityIndicatorV2 />
              ) : (
                <ThemedIcon
                  light={tailwind("text-green-v2")}
                  dark={tailwind("text-green-v2")}
                  iconType="MaterialIcons"
                  name="check-circle"
                  size={20}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </ThemedViewV2>
  );
}
