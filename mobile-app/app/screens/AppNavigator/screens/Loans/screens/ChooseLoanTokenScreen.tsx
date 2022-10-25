import { ThemedView } from "@components/themed";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { LoanParamList } from "../LoansNavigator";
import { LoanCards } from "../components/LoanCards";

type Props = StackScreenProps<LoanParamList, "ChooseLoanTokenScreen">;

export function ChooseLoanTokenScreen({ route }: Props): JSX.Element {
  const { vaultId } = route.params;

  return (
    <ThemedView style={tailwind("flex-1")}>
      <LoanCards testID="loans_cards" vaultId={vaultId} />
    </ThemedView>
  );
}
