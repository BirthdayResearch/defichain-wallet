import { ThemedView } from "@components/themed";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { debounce } from "lodash";
import { tailwind } from "@tailwind";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import {
  fetchLoanTokens,
  loanTokensSelector,
  vaultsSelector,
} from "@store/loans";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { HeaderSearchIcon } from "@components/HeaderSearchIcon";
import { HeaderSearchInput } from "@components/HeaderSearchInput";
import { useIsFocused } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { LoanParamList } from "../LoansNavigator";
import { LoanCardsV2 } from "../components/LoanCardsV2";

type Props = StackScreenProps<LoanParamList, "ChooseLoanTokenScreen">;

export function ChooseLoanTokenScreenV2({
  navigation,
  route,
}: Props): JSX.Element {
  const { vaultId } = route.params;
  const loans = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );
  const blockCount = useSelector((state: RootState) => state.block.count);
  const vaultsList = useSelector((state: RootState) =>
    vaultsSelector(state.loans)
  );
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const isFocused = useIsFocused();
  const [filteredLoans, setFilteredLoans] = useState<LoanToken[]>(loans);
  const [showSeachInput, setShowSearchInput] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [isVaultReady, setIsVaultReady] = useState(false);

  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setFilteredLoans(
        loans.filter((loan) =>
          loan.token.displaySymbol
            .toLowerCase()
            .includes(searchString.trim().toLowerCase())
        )
      );
    }, 500),
    [loans]
  );

  useEffect(() => {
    handleFilter(searchString);
  }, [searchString]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => (
        <HeaderSearchIcon onPress={() => setShowSearchInput(true)} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (showSeachInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <HeaderSearchInput
            searchString={searchString}
            onClearInput={() => setSearchString("")}
            onChangeInput={(text: string) => setSearchString(text)}
            onCancelPress={() => {
              setSearchString("");
              setShowSearchInput(false);
            }}
            placeholder="Search for loans"
          />
        ),
      });
    } else {
      navigation.setOptions({
        header: undefined,
      });
    }
  }, [showSeachInput, searchString]);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchLoanTokens({ client }));
    }
  }, [blockCount, isFocused]);

  useEffect(() => {
    setIsVaultReady(
      vaultsList.some((vault) => vault.vaultState !== VaultStatus.Empty)
    );
  }, [vaultsList]);

  return (
    <ThemedView style={tailwind("flex-1")}>
      <LoanCardsV2
        testID="loans_cards"
        loans={filteredLoans}
        vaultId={vaultId}
        vaultExist={isVaultReady}
      />
    </ThemedView>
  );
}
