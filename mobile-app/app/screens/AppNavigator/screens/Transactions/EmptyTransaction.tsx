import { NavigationProp } from "@react-navigation/native";
import { RefreshControl, Image, View } from "react-native";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import ImageNoTransaction from "@assets/images/portfolio/no_transaction.png";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";

interface EmptyTransactionProps {
  navigation: NavigationProp<PortfolioParamList>;
  handleRefresh: (nextToken?: string | undefined) => void;
  loadingStatus: string;
}

export function EmptyTransaction(props: EmptyTransactionProps): JSX.Element {
  return (
    <ThemedScrollViewV2
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.loadingStatus === "loading"}
        />
      }
      style={tailwind("px-8 pt-12 pb-2 text-center")}
      testID="empty_transaction"
    >
      <View style={tailwind("items-center justify-center px-15 pb-8")}>
        <Image source={ImageNoTransaction} style={{ width: 204, height: 96 }} />
      </View>

      <ThemedTextV2
        style={tailwind("text-xl pb-2 font-semibold-v2 text-center")}
      >
        {translate("screens/TransactionsScreen", "No transactions found")}
      </ThemedTextV2>

      <ThemedTextV2
        style={tailwind("font-normal-v2 pb-16 text-center opacity-60")}
      >
        {translate("screens/TransactionsScreen", "Start by depositing DFI")}
      </ThemedTextV2>
    </ThemedScrollViewV2>
  );
}
