import { memo, useCallback } from "react";
import {
  ThemedIcon,
  ThemedTouchableOpacityV2,
  ThemedTextV2,
} from "@components/themed";
import { Platform } from "react-native";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { ThemedFlatListV2 } from "@components/themed/ThemedFlatListV2";
import { ThemedBottomSheetFlatList } from "@components/themed/ThemedBottomSheetFlatList";

export interface BottomSheetAssetSortProps {
  onButtonPress: (item: PortfolioSortType) => void;
  denominationCurrency: string;
  selectedAssetSortType: PortfolioSortType;
}

export enum PortfolioSortType {
  HighestDenominationValue = "Highest value (denomination)",
  LowestDenominationValue = "Lowest value (denomination)",
  HighestTokenAmount = "Highest token amount",
  LowestTokenAmount = "Lowest token amount",
  AtoZ = "A to Z",
  ZtoA = "Z to A",
}

export const BottomSheetAssetSortList = ({
  onButtonPress,
  denominationCurrency,
  selectedAssetSortType,
}: BottomSheetAssetSortProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const { tailwind } = useStyles();
    const flatListComponents = {
      mobile: ThemedBottomSheetFlatList,
      web: ThemedFlatListV2,
    };
    const FlatList =
      Platform.OS === "web"
        ? flatListComponents.web
        : flatListComponents.mobile;
    const assetSortList: PortfolioSortType[] = Object.values(PortfolioSortType);
    const highestCurrencyValue = translate(
      "screens/PortfolioScreen",
      "Highest value ({{denominationCurrency}})",
      { denominationCurrency }
    );
    const lowestCurrencyValue = translate(
      "screens/PortfolioScreen",
      "Lowest value ({{denominationCurrency}})",
      { denominationCurrency }
    );
    const getDisplayedSortText = useCallback(
      (text: PortfolioSortType): string => {
        if (text === PortfolioSortType.HighestDenominationValue) {
          return highestCurrencyValue;
        } else if (text === PortfolioSortType.LowestDenominationValue) {
          return lowestCurrencyValue;
        }
        return text;
      },
      [denominationCurrency]
    );

    const renderItem = ({
      item,
      index,
    }: {
      item: PortfolioSortType;
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
          testID={`select_asset_${getDisplayedSortText(item)}`}
          key={index}
          onPress={() => {
            onButtonPress(item);
          }}
        >
          <ThemedTextV2 style={tailwind("py-2 text-sm font-normal-v2")}>
            {translate("screens/PortfolioScreen", getDisplayedSortText(item))}
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
