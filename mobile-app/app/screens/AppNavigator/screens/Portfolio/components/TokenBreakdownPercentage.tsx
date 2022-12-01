import { View } from "@components";
import { TextSkeletonLoader } from "@components/TextSkeletonLoader";
import { ThemedIcon, ThemedText, ThemedView } from "@components/themed";
import { RootState } from "@store";
import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { useSelector } from "react-redux";
import { BalanceText } from "./BalanceText";

interface TokenBreakdownPercentageProps {
  lockedAmount: BigNumber;
  displaySymbol: string;
  testID: string;
}

export function TokenBreakdownPercentage(
  props: TokenBreakdownPercentageProps
): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet);
  const { hasFetchedVaultsData } = useSelector(
    (state: RootState) => state.loans
  );

  return (
    <View style={tailwind("flex flex-row items-center mt-2")}>
      {hasFetchedToken && hasFetchedVaultsData ? (
        <>
          <LockedPercentageItem
            lockedAmount={props.lockedAmount}
            displaySymbol={props.displaySymbol}
            testID={props.testID}
          />
        </>
      ) : (
        <TextSkeletonLoader
          iContentLoaderProps={{
            width: "120",
            height: "18",
            testID: "locked_percentage_skeleton_loader",
          }}
          textWidth="120"
          textXRadius="10"
          textYRadius="10"
        />
      )}
    </View>
  );
}

interface LockedPercentageItemProps {
  lockedAmount: BigNumber;
  displaySymbol: string;
  testID: string;
}

function LockedPercentageItem(props: LockedPercentageItemProps): JSX.Element {
  return (
    <ThemedView
      style={tailwind("flex flex-row items-center py-1 px-2 rounded-xl")}
      light={tailwind("bg-gray-50")}
      dark={tailwind("bg-gray-900")}
    >
      <ThemedIcon
        light={tailwind("text-gray-600")}
        dark={tailwind("text-gray-500")}
        iconType="MaterialIcons"
        name="lock"
        size={16}
      />
      <NumberFormat
        value={props.lockedAmount.toFixed(8)}
        thousandSeparator
        displayType="text"
        suffix={` ${props.displaySymbol}`}
        renderText={(value) => (
          <ThemedText
            style={tailwind("text-xs ml-0.5")}
            testID={`${props.testID}_locked_amount`}
          >
            <BalanceText
              light={tailwind("text-gray-900")}
              dark={tailwind("text-gray-50")}
              style={tailwind("text-xs")}
              testID={`${props.testID}_locked_amount_text`}
              value={value}
            />
          </ThemedText>
        )}
      />
    </ThemedView>
  );
}
