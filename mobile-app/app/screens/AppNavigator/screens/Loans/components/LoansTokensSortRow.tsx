import { memo } from "react";
import { tailwind } from "@tailwind";
import {
  ThemedFlashList,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { Platform, View } from "react-native";
import { translate } from "@translations";
import { ThemedBottomSheetFlatList } from "@components/themed/ThemedBottomSheetFlatList";

export enum LoansTokensSortType {
  LowestOraclePrice = "Lowest oracle price",
  HighestOraclePrice = "Highest oracle price",
  LowestInterest = "Lowest interest",
  HighestInterest = "Highest interest",
  AtoZ = "A to Z",
  ZtoA = "Z to A",
}

export function LoansTokensSortRow(props: {
  isSorted: boolean;
  loansTokensSortType: LoansTokensSortType;
  onPress: () => void;
}): JSX.Element {
  return (
    <View
      style={tailwind("px-10 mt-6 mb-2 flex flex-row justify-between")}
      testID="loans_tokens_sort_row"
    >
      <ThemedTextV2
        style={tailwind("text-xs pr-1 font-normal-v2")}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
      >
        {translate("screens/LoansScreen", "AVAILABLE TOKENS")}
      </ThemedTextV2>
      <ThemedTouchableOpacityV2
        style={tailwind("flex flex-row items-center")}
        onPress={props.onPress}
        testID="loans_tokens_sort_toggle"
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-800")}
          dark={tailwind("text-mono-dark-v2-800")}
          style={tailwind("text-xs font-normal-v2")}
        >
          {translate(
            "screens/LoansScreen",
            props.isSorted ? props.loansTokensSortType : "Sort by"
          )}
        </ThemedTextV2>
        <ThemedIcon
          style={tailwind("ml-1 font-medium")}
          light={tailwind("text-mono-light-v2-800")}
          dark={tailwind("text-mono-dark-v2-800")}
          iconType="Feather"
          name="menu"
          size={16}
        />
      </ThemedTouchableOpacityV2>
    </View>
  );
}

interface BottomSheetTokensLoansSortListProps {
  onButtonPress: (item: LoansTokensSortType) => void;
  selectedLoansTokensSortType: LoansTokensSortType;
}

export const BottomSheetTokensLoansSortList = ({
  onButtonPress,
  selectedLoansTokensSortType,
}: BottomSheetTokensLoansSortListProps): React.MemoExoticComponent<
  () => JSX.Element
> =>
  memo(() => {
    const flatListComponents = {
      mobile: ThemedBottomSheetFlatList,
      web: ThemedFlashList,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;
    const assetSortList: LoansTokensSortType[] =
      Object.values(LoansTokensSortType);

    const renderItem = ({
      item,
      index,
    }: {
      item: LoansTokensSortType;
      index: number;
    }): JSX.Element => {
      const testID = `select_sort_${item.toLowerCase().replaceAll(" ", "_")}`;
      return (
        <ThemedTouchableOpacityV2
          dark={tailwind("border-mono-dark-v2-300")}
          light={tailwind("border-mono-light-v2-300")}
          style={tailwind(
            "py-3 flex-row  items-center justify-between border-b-0.5 py-2.5",
            { "border-t-0.5": index === 0 }
          )}
          testID={testID}
          key={index}
          onPress={() => {
            onButtonPress(item);
          }}
        >
          <ThemedTextV2 style={tailwind("py-2 text-sm font-normal-v2")}>
            {translate("screens/LoansScreen", item)}
          </ThemedTextV2>
          {selectedLoansTokensSortType === item && (
            <ThemedIcon
              size={20}
              name="check-circle"
              iconType="MaterialIcons"
              light={tailwind("text-green-v2")}
              dark={tailwind("text-green-v2")}
              testID={`${testID}_check`}
            />
          )}
        </ThemedTouchableOpacityV2>
      );
    };

    return (
      <FlatList
        keyExtractor={(item) => item}
        data={assetSortList}
        // parentContainerStyle={tailwind("px-5")}
        contentContainerStyle={tailwind("px-5")}
        renderItem={renderItem}
      />
    );
  });
