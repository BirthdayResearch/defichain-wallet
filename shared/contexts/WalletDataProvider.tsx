import React, { useEffect, PropsWithChildren } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from './WhaleContext'
import { fetchPoolPairs } from '@store/wallet'
import { fetchUserPreferences } from '@store/userPreferences'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

export function WalletDataProvider (props: PropsWithChildren<any>): JSX.Element | null {
  const blockCount = useSelector((state: RootState) => state.block.count)
  const client = useWhaleApiClient()
  const { network } = useNetworkContext()
  const dispatch = useDispatch()
  const { wallets } = useWalletPersistenceContext()
  const { isFeatureAvailable } = useFeatureFlagContext()

  // Global polling based on blockCount and network, so no need to fetch per page
  useEffect(() => {
    dispatch(fetchPoolPairs({ client }))
  }, [blockCount, network])

  // Fetch user data on start up
  // Will only refetch on network or wallet change
  useEffect(() => {
    if (isFeatureAvailable('local_storage')) {
      dispatch(fetchUserPreferences(network))
    }
  }, [network, wallets])

  return (
    <>
      {props.children}
    </>
  )
}
