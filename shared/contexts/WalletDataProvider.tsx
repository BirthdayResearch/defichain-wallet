import React, { useEffect, PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { fetchPoolPairs } from '@store/wallet'
import { fetchTokens } from '@store/wallet'

export function WalletDataProvider (props: PropsWithChildren<any>): JSX.Element | null {
  const blockCount = useSelector((state: RootState) => state.block.count)
  const client = useWhaleApiClient()
  const { network } = useNetworkContext()
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  // Global polling based on blockCount and network, so no need to fetch per page
  useEffect(() => {
    dispatch(fetchPoolPairs({ client }))
  }, [blockCount, network])

  // Global polling based on blockCount, network and address, so no need to fetch per page
  useEffect(() => {
    dispatch(fetchTokens({ client, address }))
  }, [blockCount, network, address])

  return (
    <>
      {props.children}
    </>
  )
}
