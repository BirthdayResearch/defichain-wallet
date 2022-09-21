import { tailwind } from "@tailwind";
import { ThemedScrollView } from "@components/themed";
import { VaultCard } from "@screens/AppNavigator/screens/Loans/components/VaultCard";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useEffect, useRef } from "react";
import {
  fetchCollateralTokens,
  fetchVaults,
  vaultsSelector,
} from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useIsFocused, useScrollToTop } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { View } from "@components";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { EmptyVaultV2 } from "./EmptyVaultV2";

export function VaultsV2(): JSX.Element {
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const isFocused = useIsFocused();
  const { address } = useWalletContext();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const ref = useRef(null);
  useScrollToTop(ref);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchVaults({ address, client }));
    }
  }, [blockCount, address, isFocused]);

  useEffect(() => {
    dispatch(fetchCollateralTokens({ client }));
  }, []);

  const {
    vaults: _vaults, // ? TODO: find out diff
    hasFetchedVaultsData,
  } = useSelector((state: RootState) => state.loans);

  if (!hasFetchedVaultsData) {
    return (
      <View style={tailwind("mt-1")}>
        <SkeletonLoader row={3} screen={SkeletonLoaderScreen.Vault} />
      </View>
    );
  } else if (vaults?.length === 0) {
    return <EmptyVaultV2 handleRefresh={() => {}} isLoading={false} />;
  }

  return (
    <ThemedScrollView contentContainerStyle={tailwind("p-4 pb-8")} ref={ref}>
      {vaults.map((vault, index) => {
        return (
          <VaultCard testID={`vault_card_${index}`} key={index} vault={vault} />
        );
      })}
    </ThemedScrollView>
  );
}
