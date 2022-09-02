import React, { useEffect, PropsWithChildren } from "react";
import { batch, useSelector } from "react-redux";
import { RootState } from "@store";
import { useNetworkContext } from "@shared-contexts/NetworkContext";
import { fetchDexPrice, fetchPoolPairs, fetchTokens } from "@store/wallet";
import { fetchUserPreferences } from "@store/userPreferences";
import { useWalletPersistenceContext } from "@shared-contexts/WalletPersistenceContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { fetchVaults } from "@store/loans";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { useWhaleApiClient } from "./WhaleContext";

export function WalletDataProvider(
  props: PropsWithChildren<any>
): JSX.Element | null {
  const blockCount = useSelector((state: RootState) => state.block.count);
  const client = useWhaleApiClient();
  const { network } = useNetworkContext();
  const dispatch = useAppDispatch();
  const { address } = useWalletContext();
  const { wallets } = useWalletPersistenceContext();
  const { isFeatureAvailable } = useFeatureFlagContext();

  // Global polling based on blockCount and network, so no need to fetch per page
  useEffect(() => {
    batch(() => {
      dispatch(fetchPoolPairs({ client }));
      dispatch(
        fetchDexPrice({
          client,
          denomination: "USDT",
        })
      );
    });
  }, [blockCount, network]);

  // Fetch user data on start up
  // Will only refetch on network or wallet change
  useEffect(() => {
    if (isFeatureAvailable("local_storage")) {
      dispatch(fetchUserPreferences(network));
    }
  }, [network, wallets]);

  /* Global polling based on blockCount, network and address */
  useEffect(() => {
    batch(() => {
      dispatch(
        fetchTokens({
          client,
          address,
        })
      );
      dispatch(
        fetchVaults({
          client,
          address,
        })
      );
    });
  }, [blockCount, network, address]);

  return <>{props.children}</>;
}
