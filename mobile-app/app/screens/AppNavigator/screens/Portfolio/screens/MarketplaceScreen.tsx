import { ImageSourcePropType, View, Image } from "react-native";
import {
  ThemedIcon,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedViewV2,
  ThemedTouchableListItem,
  ThemedFlashList,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { openURL } from "@api/linking";
import Kucoin from "@assets/images/exchanges/Kucoin.png";
import Bittrex from "@assets/images/exchanges/Bittrex.png";
import Bitrue from "@assets/images/exchanges/Bitrue.png";
import Latoken from "@assets/images/exchanges/Latoken.png";
import DFX from "@assets/images/exchanges/DFX.png";
import Transak from "@assets/images/exchanges/Transak.png";
import EasyCrypto from "@assets/images/exchanges/EasyCrypto.png";
import CakeDeFi from "@assets/images/exchanges/CakeDeFi.png";
import Bybit from "@assets/images/exchanges/Bybit.png";
import Swyftx from "@assets/images/exchanges/Swyftx.png";
import Huobi from "@assets/images/exchanges/Huobi.png";

interface ExchangeProps {
  image: ImageSourcePropType;
  name: string;
  url: string;
}

const exchanges: ExchangeProps[] = [
  {
    name: "Kucoin",
    image: Kucoin,
    url: "https://www.kucoin.com/trade/DFI-BTC",
  },
  {
    name: "Huobi",
    image: Huobi,
    url: "https://www.huobi.com/en-us/exchange/dfi_usdt",
  },
  {
    name: "Bittrex",
    image: Bittrex,
    url: "https://global.bittrex.com/Market/Index?MarketName=BTC-DFI",
  },
  {
    name: "Bitrue",
    image: Bitrue,
    url: "https://www.bitrue.com/trade/dfi_btc",
  },
  {
    name: "Latoken",
    image: Latoken,
    url: "https://latoken.com/exchange/DFI_BTC",
  },
  {
    name: "DFX",
    image: DFX,
    url: "https://dfx.swiss/en/",
  },
  {
    name: "Transak",
    image: Transak,
    url: "https://global.transak.com/",
  },
  {
    name: "EasyCrypto (Australia)",
    image: EasyCrypto,
    url: "https://easycrypto.com/au/buy-sell/dfi-defichain",
  },
  {
    name: "EasyCrypto (New Zealand)",
    image: EasyCrypto,
    url: "https://easycrypto.com/nz/buy-sell/dfi-defichain",
  },
  {
    name: "Bybit",
    image: Bybit,
    url: "https://www.bybit.com/en-US/trade/spot/DFI/USDT",
  },
  {
    name: "Swyftx",
    image: Swyftx,
    url: "https://swyftx.com/au/buy/defichain/",
  },
  {
    name: "Cake DeFi",
    image: CakeDeFi,
    url: "https://cakedefi.com/",
  },
];

export function MarketplaceScreen(): JSX.Element {
  return (
    <ThemedFlashList
      estimatedItemSize={8}
      testID="language_selection_screen"
      parentContainerStyle={tailwind("px-5 pb-16")}
      ListHeaderComponent={() => (
        <ThemedSectionTitleV2
          testID="language_selection_screen_title"
          text={translate("screens/MarketplaceScreen", "GET DFI FROM")}
        />
      )}
      renderItem={({ item, index }) => (
        <ThemedViewV2
          dark={tailwind("bg-mono-dark-v2-00")}
          light={tailwind("bg-mono-light-v2-00")}
          style={tailwind("px-5", {
            "rounded-t-lg-v2": index === 0,
            "rounded-b-lg-v2": index === exchanges.length - 1,
          })}
        >
          <ExchangeItemRow
            url={item.url}
            key={item.name}
            name={item.name}
            image={item.image}
            testID={`exchange_${index}`}
            isLast={index === exchanges.length - 1}
          />
        </ThemedViewV2>
      )}
      data={exchanges}
      keyExtractor={(item, index) => `${index}`}
    />
  );
}

function ExchangeItemRow({
  image,
  name,
  url,
  testID,
  isLast,
}: ExchangeProps & {
  isLast: boolean;
  testID: string;
}): JSX.Element {
  return (
    <ThemedTouchableListItem
      onPress={async () => await openURL(url)}
      isLast={isLast}
      styleProps="py-4"
      testID={testID}
    >
      <View style={tailwind("flex flex-row items-center")}>
        <Image source={image} style={tailwind("h-6 w-6")} />
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
          style={tailwind("font-normal-v2 text-sm ml-2")}
        >
          {name}
        </ThemedTextV2>
      </View>
      <ThemedIcon
        size={18}
        name="open-in-new"
        iconType="MaterialIcons"
        dark={tailwind("text-mono-dark-v2-700")}
        light={tailwind("text-mono-light-v2-700")}
      />
    </ThemedTouchableListItem>
  );
}
