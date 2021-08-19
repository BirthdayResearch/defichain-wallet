import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../api'
import { isPlayground } from '../environment'
import { RootState } from '../store'
import { block } from '../store/block'
import { publish } from '../store/transaction_notification'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'

export function StatsProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()
  const isPolling = useSelector((state: RootState) => state.block.isPolling)
  const api = useWhaleApiClient()
  const interval: number = isPlayground(network) ? 3000 : 30000

  const dispatch = useDispatch()

  useEffect(() => {
    // TODO: https://reactnative.dev/docs/appstate refactor to support app app refreshing
    //  isPolling is a good indicator of background polling
    //  we can use AppState to suspend and activate polling based on user activity
    let intervalID: number

    function refresh (): void {
      dispatch(block.actions.setPolling(true))
      api.stats.get().then(({ count }) => {
        dispatch(publish({ count: count.blocks, client: api }))
        dispatch(block.actions.updateBlock({ count: count.blocks }))
        dispatch(block.actions.setConnected(true))
      }).catch((err) => {
        dispatch(block.actions.updateBlock({ count: 0 }))
        dispatch(block.actions.setConnected(false))
        Logging.error(err)
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
