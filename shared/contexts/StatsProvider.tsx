import React, { useEffect, PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { isPlayground } from "@waveshq/walletkit-core";
import { RootState } from "@store";
import { block } from "@waveshq/walletkit-ui/dist/store/block";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWhaleApiClient } from "./WhaleContext";

export function StatsProvider(
  props: PropsWithChildren<any>
): JSX.Element | null {
  const { network } = useNetworkContext();
  const logger = useLogger();
  const isPolling = useSelector((state: RootState) => state.block.isPolling);
  const api = useWhaleApiClient();
  const interval: number = isPlayground(network) ? 3000 : 30000;

  const dispatch = useAppDispatch();

  useEffect(() => {
    // TODO: https://reactnative.dev/docs/appstate refactor to support app app refreshing
    //  isPolling is a good indicator of background polling
    //  we can use AppState to suspend and activate polling based on user activity
    let intervalID: NodeJS.Timeout;

    function refresh(): void {
      dispatch(block.actions.setPolling(true));
      // if blockchain is connected successfully, update both lastSync & lastSuccessfulSync to current date
      api.stats
        .get()
        .then(({ count, tvl }) => {
          dispatch(
            block.actions.updateBlockDetails({
              count: count.blocks,
              masternodeCount: count.masternodes,
              lastSync: new Date().toString(),
              lastSuccessfulSync: new Date().toString(),
              tvl: tvl?.dex ?? 0,
            })
          );
          dispatch(block.actions.setConnected(true));
        })
        .catch((err) => {
          // if blockchain is not connected successfully, only update value of lastSync to current date
          dispatch(
            block.actions.updateBlockDetails({
              count: 0,
              masternodeCount: 0,
              lastSync: new Date().toString(),
            })
          );
          dispatch(block.actions.setConnected(false));
          logger.error(err);
        });
    }

    if (!isPolling) {
      refresh();
      intervalID = setInterval(refresh, interval);
    }
    return () => {
      dispatch(block.actions.setPolling(false));
      if (intervalID !== undefined) {
        clearInterval(intervalID);
      }
    };
  }, [api, interval, network, dispatch]);

  return <>{props.children}</>;
}
