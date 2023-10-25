import { Dimensions, ImageSourcePropType, Platform } from "react-native";
import { Image } from "expo-image";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import ImageADark from "@assets/images/onboarding/welcome-screen-a-dark.png";
import ImageBDark from "@assets/images/onboarding/welcome-screen-b-dark.png";
import ImageCDark from "@assets/images/onboarding/welcome-screen-c-dark.png";
import ImageDDark from "@assets/images/onboarding/welcome-screen-d-dark.png";
import ImageEDark from "@assets/images/onboarding/welcome-screen-e-dark.png";
import ImageALight from "@assets/images/onboarding/welcome-screen-a-light.png";
import ImageBLight from "@assets/images/onboarding/welcome-screen-b-light.png";
import ImageCLight from "@assets/images/onboarding/welcome-screen-c-light.png";
import ImageDLight from "@assets/images/onboarding/welcome-screen-d-light.png";
import ImageELight from "@assets/images/onboarding/welcome-screen-e-light.png";
import { View } from "@components";
import { ThemedTextV2 } from "@components/themed";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { CarouselPagination } from "@screens/WalletNavigator/screens/components/CarouselPagination";

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
    subtitle="DeFiChain Wallet is fully non-custodial. Only you will have access to your fund."
    title="Take full control"
  />,
  <ImageSlide
    imageDark={ImageBDark}
    imageLight={ImageBLight}
    key={1}
    subtitle="Review your available and locked assets in your portfolio."
    title="View your assets in one place"
  />,
  <ImageSlide
    imageDark={ImageCDark}
    imageLight={ImageCLight}
    key={2}
    subtitle="Trade on the DEX and earn rewards from liquidity mining with crypto and dTokens."
    title="Maximize earning potential"
  />,

  <ImageSlide
    imageDark={ImageDDark}
    imageLight={ImageDLight}
    key={3}
    subtitle="Access financial opportunities with dTokens minted through decentralized vaults."
    title="Decentralized loans"
  />,
  <ImageSlide
    imageDark={ImageEDark}
    imageLight={ImageELight}
    key={4}
    subtitle="Seamless transfers between DeFiChain and MetaChain via generated EVM address."
    title="EVM compatible"
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
    <View style={tailwind("flex-1 items-center justify-center px-10")}>
      <Image
        contentFit="contain"
        source={isLight ? imageLight : imageDark}
        style={{ width: 204, height: 136 }}
      />
      <View style={tailwind("items-center justify-center mt-7 mb-5")}>
        <ThemedTextV2 style={tailwind("text-xl font-semibold-v2 text-center")}>
          {translate("screens/OnboardingCarousel", title)}
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind("font-normal-v2 text-center mt-2")}>
          {translate("screens/OnboardingCarousel", subtitle)}
        </ThemedTextV2>
      </View>
    </View>
  );
}

export function OnboardingCarousel(): JSX.Element {
  const { isLight } = useThemeContext();
  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={30}
      autoplayLoop
      autoplayLoopKeepAnimation
      data={slides}
      index={0}
      paginationActiveColor={
        isLight ? getColor("mono-light-v2-900") : getColor("mono-dark-v2-900")
      }
      paginationStyleItemActive={tailwind("w-6 h-1.5")}
      paginationDefaultColor={
        isLight ? getColor("mono-light-v2-500") : getColor("mono-dark-v2-500")
      }
      paginationStyleItem={tailwind("h-1.5 w-1.5 mx-0.75")}
      PaginationComponent={CarouselPagination}
      renderItem={({ item }) => (
        <View style={{ width: Number(width) }}>{item}</View>
      )}
      showPagination
    />
  );
}
