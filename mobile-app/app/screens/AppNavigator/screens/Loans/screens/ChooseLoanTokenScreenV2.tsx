import { ThemedView } from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { LoanParamList } from "../LoansNavigator";
import { LoanCardsV2 } from "../components/LoanCards";

type Props = StackScreenProps<LoanParamList, "ChooseLoanTokenScreen">;

export function ChooseLoanTokenScreenV2({ route }: Props): JSX.Element {
  const { vaultId } = route.params;

  return (
    <ThemedView style={tailwind("flex-1")}>
      <LoanCardsV2 testID="loans_cards" vaultId={vaultId} />
    </ThemedView>
  );
}
