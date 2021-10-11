import React, { useEffect, PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isPlayground } from '@environment'
import { RootState } from '@store'
import { block } from '@store/block'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '../../mobile-app/app/contexts/WhaleContext'

type StatsProviderI = PropsWithChildren<any> &{
  log: {
    error: (error: any) => void
  }
}

export function StatsProvider (props: StatsProviderI): JSX.Element | null {
  const { network } = useNetworkContext()
  const { log } = props
  const isPolling = useSelector((state: RootState) => state.block.isPolling)
  const api = useWhaleApiClient()
  const interval: number = isPlayground(network) ? 3000 : 30000

  const dispatch = useDispatch()

  useEffect(() => {
    // TODO: https://reactnative.dev/docs/appstate refactor to support app app refreshing
    //  isPolling is a good indicator of background polling
    //  we can use AppState to suspend and activate polling based on user activity
    let intervalID: NodeJS.Timeout

    function refresh (): void {
      dispatch(block.actions.setPolling(true))
      api.stats.get().then(({ count }) => {
        dispatch(block.actions.updateBlockDetails({
          count: count.blocks,
          masternodeCount: count.masternodes,
          lastSync: new Date().toString()
        }))
        dispatch(block.actions.setConnected(true))
      }).catch((err) => {
        dispatch(block.actions.updateBlockDetails({ count: 0, masternodeCount: 0 }))
        dispatch(block.actions.setConnected(false))
        log.error(err)
      })
    }

    if (!isPolling) {
      refresh()
      intervalID = setInterval(refresh, interval)
    }
    return () => {
      dispatch(block.actions.setPolling(false))
      if (intervalID !== undefined) {
        clearInterval(intervalID)
      }
    }
  }, [api, interval, network, dispatch])

  return (
    <>
      {props.children}
    </>
  )
}
