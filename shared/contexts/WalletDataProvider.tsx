import React, { useEffect, PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from './WhaleContext'
import { fetchPoolPairs } from '@store/wallet'

export function WalletDataProvider (props: PropsWithChildren<any>): JSX.Element | null {
  const blockCount = useSelector((state: RootState) => state.block.count)
  const client = useWhaleApiClient()
  const { network } = useNetworkContext()
  const dispatch = useDispatch()

  // Global polling based on blockCount and network, so no need to fetch per page
  useEffect(() => {
    dispatch(fetchPoolPairs({ client }))
  }, [blockCount, network])

  return (
    <>
      {props.children}
    </>
  )
}
