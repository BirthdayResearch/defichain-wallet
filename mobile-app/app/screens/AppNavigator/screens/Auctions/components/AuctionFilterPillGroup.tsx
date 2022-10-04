import React, { memo } from "react";
import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { translate } from "@translations";
import { ScrollView, View } from "react-native";
import { ButtonGroupTabKey } from "./BrowseAuctions";
import { AssetsFilterItem } from "../../Portfolio/components/AssetsFilterRow";

export const AuctionFilterPillGroup = memo(
  (props: {
    onSearchBtnPress: () => void;
    onButtonGroupChange: (buttonGroupTabKey: ButtonGroupTabKey) => void;
    activeButtonGroup: ButtonGroupTabKey;
  }) => {
    const buttonGroup = [
      {
        id: ButtonGroupTabKey.AllBids,
        label: translate("screens/AuctionScreen", "All auctions"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.AllBids),
      },
      {
        id: ButtonGroupTabKey.YourActiveBids,
        label: translate("screens/AuctionScreen", "Your active bids"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.YourActiveBids),
      },
      {
        id: ButtonGroupTabKey.YourLeadingBids,
        label: translate("screens/AuctionScreen", "Your leading bids"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.YourLeadingBids),
      },
      {
        id: ButtonGroupTabKey.Outbid,
        label: translate("screens/AuctionScreen", "Outbid"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.Outbid),
      },
    ];

    return (
      <View style={tailwind("my-4")}>
        <ThemedViewV2 testID="auction_button_group">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tailwind(
              "flex justify-between items-center flex-row px-5"
            )}
          >
            <ThemedTouchableOpacityV2
              onPress={props.onSearchBtnPress}
              style={tailwind("text-center pr-4")}
              testID="auction_search_icon"
            >
              <ThemedIcon
                iconType="Feather"
                name="search"
                size={24}
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
              />
            </ThemedTouchableOpacityV2>
            {buttonGroup.map((button, index) => (
              <AssetsFilterItem
                key={button.id}
                label={button.label}
                onPress={button.handleOnPress}
                isActive={props.activeButtonGroup === button.id}
                testID={`dex_button_group_${button.id}`}
                additionalStyles={
                  !(buttonGroup.length === index) ? tailwind("mr-3") : undefined
                }
              />
            ))}
          </ScrollView>
        </ThemedViewV2>
      </View>
    );
  }
);
