import { tailwind } from "@tailwind";
import { InfoTextLinkV2 } from "@components/InfoTextLink";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { translate } from "@translations";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { AuctionsParamList } from "../AuctionNavigator";
import { EmptyTokensScreen } from "../../Portfolio/components/EmptyTokensScreen";
import { EmptyAuctionsDark } from "../../Portfolio/assets/EmptyAuctionsDark";
import { EmptyAuctionsLight } from "../../Portfolio/assets/EmptyAuctionsLight";

export function EmptyAuction({
  title,
  subTitle,
  showInfo,
}: {
  title: string;
  subTitle: string;
  showInfo?: boolean;
}): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const { isLight } = useThemeContext();
  const goToAuctionsFaq = (): void => {
    navigation.navigate("AuctionsFaq");
  };

  return (
    <>
      <EmptyTokensScreen
        icon={isLight ? EmptyAuctionsLight : EmptyAuctionsDark}
        containerStyle={tailwind("mt-12 px-11 mb-0")}
        testID="empty_auctions_screen"
        title={translate("components/EmptyAuctions", title)}
        subTitle={translate("components/EmptyAuctions", subTitle)}
      />
      {showInfo && (
        <InfoTextLinkV2
          containerStyle={tailwind("mt-2 justify-center items-center")}
          textStyle={tailwind("text-sm font-semibold-v2")}
          onPress={goToAuctionsFaq}
          text="Learn more"
          testId="empty_auctions_learn_more"
        />
      )}
    </>
  );
}
