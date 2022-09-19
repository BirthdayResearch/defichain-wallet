import { Feather } from "@expo/vector-icons";
import * as React from "react";
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableListItem,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { openURL } from "@api/linking";

export function CommunityScreen(): JSX.Element {
  return (
    <ThemedFlatList
      ListHeaderComponent={
        <ThemedSectionTitleV2
          testID="community_title"
          text={translate("screens/CommunityScreen", "JOIN THE COMMUNITY")}
        />
      }
      data={Communities}
      renderItem={({ item, index }) => (
        <CommunityItemRow
          key={item.id}
          item={item}
          first={index === 0}
          last={index === Communities.length - 1}
        />
      )}
      testID="community_flat_list"
      light={tailwind("bg-mono-light-v2-100")}
      dark={tailwind("bg-mono-dark-v2-100")}
      style={tailwind("px-5")}
    />
  );
}

interface CommunityItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}

const Communities: CommunityItem[] = [
  {
    id: "announcements",
    title: "Announcements",
    url: "https://t.me/defichain_announcements",
    icon: "bell",
  },
  {
    id: "faq",
    title: "Frequently asked questions",
    url: "https://defichain.com/learn/#faq",
    icon: "help-circle",
  },
  {
    id: "gh",
    title: "Report issue on GitHub",
    url: "https://github.com/DeFiCh/wallet/issues",
    icon: "flag",
  },
  {
    id: "tg_en",
    title: "Telegram (EN)",
    url: "https://t.me/defiblockchain",
    icon: "message-square",
  },
  {
    id: "tg_de",
    title: "Telegram (DE)",
    url: "https://t.me/defiblockchain_DE",
    icon: "message-square",
  },
  {
    id: "wechat",
    title: "WeChat",
    url: "http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB",
    icon: "message-square",
  },
];

function CommunityItemRow({
  item,
  first,
  last,
}: {
  item: CommunityItem;
  first: boolean;
  last: boolean;
}): JSX.Element {
  const handlePress = async (): Promise<void> => {
    await openURL(item.url);
  };

  return (
    <ThemedViewV2
      dark={tailwind("bg-mono-dark-v2-00")}
      light={tailwind("bg-mono-light-v2-00")}
      style={tailwind("px-5", {
        "rounded-t-lg-v2": first,
        "rounded-b-lg-v2": last,
      })}
    >
      <ThemedTouchableListItem
        onPress={handlePress}
        testID={item.id}
        showTopBorder={!first}
        styleProps="flex-row items-center py-4.5"
      >
        <ThemedTextV2 style={tailwind("flex-1 font-normal-v2 text-sm mr-4")}>
          {translate("screens/CommunityScreen", item.title)}
        </ThemedTextV2>

        <ThemedIcon
          dark={tailwind("text-mono-dark-v2-700")}
          iconType="Feather"
          light={tailwind("text-mono-light-v2-700")}
          name={item.icon}
          size={16}
        />
      </ThemedTouchableListItem>
    </ThemedViewV2>
  );
}
