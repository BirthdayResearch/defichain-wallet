import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { InfoTextLinkV2 } from "@components/InfoTextLink";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AuctionsParamList } from "../AuctionNavigator";
import { EmptyTokensScreen } from "../../Portfolio/components/EmptyTokensScreen";
import { EmptyAuctions } from "../../Portfolio/assets/EmptyAuctions";

export function EmptyAuction(): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();

  const goToAuctionsFaq = (): void => {
    navigation.navigate("AuctionsFaq");
  };

  return (
    <>
      <EmptyTokensScreen
        icon={EmptyAuctions}
        containerStyle={tailwind("mt-12 px-11")}
        testID="empty_auctions_screen"
        title={translate("components/EmptyAuctions", "No Auctions")}
        subTitle={translate(
          "components/EmptyAuctions",
          "There are currently no collaterals available for auction."
        )}
      />
      <InfoTextLinkV2
        containerStyle={tailwind("mt-2 justify-center items-center")}
        textStyle={tailwind("text-sm")}
        onPress={goToAuctionsFaq}
        text="Learn more"
        testId="empty_auctions_learn_more"
      />
    </>
  );
}
