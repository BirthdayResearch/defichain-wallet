import { memo } from "react";
import { tailwind } from "@tailwind";
import {
  ThemedFlatListV2,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { Platform, View } from "react-native";
import { translate } from "@translations";
import { ThemedBottomSheetFlatList } from "@components/themed/ThemedBottomSheetFlatList";

export enum AuctionsSortType {
  LeastTimeLeft = "Least time left",
  MostTimeLeft = "Most time left ",
  HighestValue = "Highest value",
  LowestValue = "Lowest value",
}

export function AuctionsSortRow(props: {
  isSorted: boolean;
  assetSortType: AuctionsSortType;
  onPress: () => void;
}): JSX.Element {
  return (
    <View
      style={tailwind("px-10 mt-3 flex flex-row justify-between")}
      testID="toggle_sorting_auctions"
    >
      <ThemedTextV2
        style={tailwind("text-xs pr-1 font-normal-v2")}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
      >
        {translate("screens/AuctionsScreen", "COLLATERALS")}
      </ThemedTextV2>
      <ThemedTouchableOpacityV2
        style={tailwind("flex flex-row items-center")}
        onPress={props.onPress}
        testID="auctions_sorting_dropdown_arrow"
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-800")}
          dark={tailwind("text-mono-dark-v2-800")}
          style={tailwind("text-xs font-normal-v2")}
        >
          {translate(
            "screens/AuctionsScreen",
            props.isSorted ? props.assetSortType : "Sort by"
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

interface BottomSheetAssetSortProps {
  onButtonPress: (item: AuctionsSortType) => void;
  selectedAssetSortType: AuctionsSortType;
}

export const BottomSheetAssetSortList = ({
  onButtonPress,
  selectedAssetSortType,
}: BottomSheetAssetSortProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const flatListComponents = {
      mobile: ThemedBottomSheetFlatList,
      web: ThemedFlatListV2,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;
    const assetSortList: AuctionsSortType[] = Object.values(AuctionsSortType);

    const renderItem = ({
      item,
      index,
    }: {
      item: AuctionsSortType;
      index: number;
    }): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          dark={tailwind("border-mono-dark-v2-300")}
          light={tailwind("border-mono-light-v2-300")}
          style={tailwind(
            "py-3 flex-row  items-center justify-between border-b-0.5 py-2.5",
            { "border-t-0.5": index === 0 }
          )}
          testID={`select_sort_${item}`}
          key={index}
          onPress={() => {
            onButtonPress(item);
          }}
        >
          <ThemedTextV2 style={tailwind("py-2 text-sm font-normal-v2")}>
            {translate("screens/AuctionsScreen", item)}
          </ThemedTextV2>
          {selectedAssetSortType === item && (
            <ThemedIcon
              size={20}
              name="check-circle"
              iconType="MaterialIcons"
              light={tailwind("text-green-v2")}
              dark={tailwind("text-green-v2")}
            />
          )}
        </ThemedTouchableOpacityV2>
      );
    };

    return (
      <FlatList
        keyExtractor={(item) => item}
        data={assetSortList}
        contentContainerStyle={tailwind("px-5")}
        renderItem={renderItem}
      />
    );
  });
