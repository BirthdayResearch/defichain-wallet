import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { InfoTextLinkV2 } from "@components/InfoTextLink";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AuctionsParamList } from "../AuctionNavigator";
import { EmptyTokensScreen } from "../../Portfolio/components/EmptyTokensScreen";
import { EmptyLPTokenIcon } from "../../Portfolio/assets/EmptyLPTokenIcon";

export function EmptyAuction(): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();

  const goToAuctionsFaq = (): void => {
    navigation.navigate("AuctionsFaq");
  };

  return (
    <>
      <EmptyTokensScreen
        icon={EmptyLPTokenIcon}
        containerStyle={tailwind("pt-14")}
        testID="empty_auctions_screen"
        title={translate("components/EmptyAuctions", "No Auctions")}
        subTitle={translate(
          "components/EmptyAuctions",
          "There is currently no collaterals up for auctions"
        )}
      />
      <InfoTextLinkV2
        containerStyle={tailwind("mt-2 justify-center items-center")}
        textStyle={tailwind("text-sm")}
        onPress={goToAuctionsFaq}
        text="Learn more about auctions"
        testId="empty_auctions_learn_more"
      />
    </>
  );
}
