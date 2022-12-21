import { StackScreenProps } from "@react-navigation/stack";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { useLayoutEffect } from "react";
import { translate } from "@translations";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { OCGProposalType } from "@screens/AppNavigator/screens/Portfolio/screens/OCG/OCGProposalsScreen";
import { ThemedScrollViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { ProposalURLInput } from "@screens/AppNavigator/screens/Portfolio/components/ProposalURLInput";

type Props = StackScreenProps<PortfolioParamList, "ProposalDetailScreen">;

export function ProposalDetailScreen({ route }: Props): JSX.Element {
  const { proposalType } = route.params;

  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();

  useLayoutEffect(() => {
    const title = translate(
      "screens/ProposalDetailScreen",
      proposalType === OCGProposalType.CFP ? "CFP Details" : "DFIP Details"
    );

    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, proposalType]);

  return (
    <ThemedScrollViewV2 contentContainerStyle={tailwind("px-5")}>
      <ProposalURLInput />
    </ThemedScrollViewV2>
  );
}
