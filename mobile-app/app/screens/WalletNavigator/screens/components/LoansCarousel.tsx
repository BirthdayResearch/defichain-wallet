import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  View,
} from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import ImageADark from "@assets/images/loans/loans_1_dark.png";
import ImageBDark from "@assets/images/loans/loans_2_dark.png";
import ImageCDark from "@assets/images/loans/loans_3_dark.png";
import ImageDDark from "@assets/images/loans/loans_4_dark.png";
import ImageALight from "@assets/images/loans/loans_1_light.png";
import ImageBLight from "@assets/images/loans/loans_2_light.png";
import ImageCLight from "@assets/images/loans/loans_3_light.png";
import ImageDLight from "@assets/images/loans/loans_4_light.png";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { CarouselPaginationWithNextButton } from "@screens/WalletNavigator/screens/components/CarouselPagination";
import React from "react";

interface CarouselImage {
  imageDark: ImageSourcePropType;
  imageLight: ImageSourcePropType;
  title: string;
  subtitle: string;
}

const slides: JSX.Element[] = [
  <ImageSlide
    imageDark={ImageADark}
    imageLight={ImageALight}
    key={0}
    subtitle="With vaults, you gain access to a rich economy of decentralized tokens."
    title="Decentralized tokens"
  />,
  <ImageSlide
    imageDark={ImageBDark}
    imageLight={ImageBLight}
    key={1}
    subtitle="With a selected loan scheme, you control how much is required for your vault."
    title="Take control of your vault"
  />,
  <ImageSlide
    imageDark={ImageCDark}
    imageLight={ImageCLight}
    key={2}
    subtitle="Keep your vaults healthy and green, by monitoring its collateralization."
    title="Monitor your vaults"
  />,

  <ImageSlide
    imageDark={ImageDDark}
    imageLight={ImageDLight}
    key={3}
    subtitle="With price oracles, your loans and vaults are tracked with real-time market prices."
    title="Real world market prices"
  />,
];

// Needs for it to work on web. Otherwise, it takes full window size
const { width } =
  Platform.OS === "web" ? { width: "375px" } : Dimensions.get("window");

export function ImageSlide({
  imageDark,
  imageLight,
  title,
  subtitle,
}: CarouselImage): JSX.Element {
  const { isLight } = useThemeContext();
  return (
    <View style={tailwind("items-center justify-center px-15 py-4")}>
      <Image
        source={isLight ? imageLight : imageDark}
        style={{ width: 204, height: 136 }}
      />
      <View style={tailwind("items-center justify-center mt-7 mb-5")}>
        <ThemedTextV2 style={tailwind("text-xl font-semibold-v2 text-center")}>
          {translate("screens/LoansCarousel", title)}
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind("font-normal-v2 text-center mt-2")}>
          {translate("screens/LoansCarousel", subtitle)}
        </ThemedTextV2>
        {/* @chloe TODO: get translations */}
      </View>
    </View>
  );
}

export function LoansCarousel({
  dismissModal,
}: {
  dismissModal: () => void;
}): JSX.Element {
  const { isLight } = useThemeContext();

  return (
    <ThemedViewV2
      style={tailwind(
        { "-mt-0.5": Platform.OS === "ios" },
        { "-mt-1": Platform.OS === "android" }
      )}
    >
      {/* -mt-1 above and mt-1 added below is kind of hack to solved React Navigation elevation bug on android for now. */}
      <View
        style={tailwind({
          "mt-1": Platform.OS === "ios",
          "mt-2": Platform.OS === "android",
        })}
        testID="loans_bottom_sheet"
      >
        <SwiperFlatList
          autoplay
          autoplayDelay={30}
          autoplayLoop
          autoplayLoopKeepAnimation
          data={slides}
          index={0}
          paginationActiveColor={
            isLight
              ? getColor("mono-light-v2-900")
              : getColor("mono-dark-v2-900")
          }
          paginationStyleItemActive={tailwind("w-6 h-1.5")}
          paginationDefaultColor={
            isLight
              ? getColor("mono-light-v2-500")
              : getColor("mono-dark-v2-500")
          }
          paginationStyleItem={tailwind("h-1.5 w-1.5 mx-0.75")}
          PaginationComponent={(props) => (
            <CarouselPaginationWithNextButton
              {...props}
              dismissModal={dismissModal}
            />
          )}
          renderItem={({ item }) => <View style={{ width }}>{item}</View>}
          showPagination
        />
      </View>
    </ThemedViewV2>
  );
}
