import { isPlayground } from "@waveshq/walletkit-core";
import React, { PropsWithChildren, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { block, BlockState } from "../store";
import { BaseLogger } from "./logger";
import { useNetworkContext } from "./NetworkContext";
import { useWhaleApiClient } from "./WhaleContext";

export interface StatsProviderProps extends PropsWithChildren<{}> {
  logger: BaseLogger;
}

export function StatsProvider(props: StatsProviderProps): JSX.Element | null {
  const { logger, children } = props;
  const { network } = useNetworkContext();
  const isPolling = useSelector((state: BlockState) => state.isPolling);
  const api = useWhaleApiClient();
  const interval: number = isPlayground(network) ? 3000 : 30000;

  const dispatch = useDispatch();

  useEffect(() => {
    //  isPolling is a good indicator of background polling
    //  we can use AppState to suspend and activate polling based on user activity
    let intervalID: NodeJS.Timeout;
    let timeoutID: NodeJS.Timeout;

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
            }),
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
            }),
          );
          dispatch(block.actions.setConnected(false));
          logger.error(err);
        });
    }

    if (!isPolling) {
      timeoutID = setTimeout(() => {
        refresh();
        intervalID = setInterval(refresh, interval);
      }, 1000);
    }
    return () => {
      dispatch(block.actions.setPolling(false));
      if (intervalID !== undefined) {
        clearInterval(intervalID);
      }
      if (timeoutID !== undefined) {
        clearTimeout(timeoutID);
      }
    };
  }, [api, interval, network, dispatch]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
