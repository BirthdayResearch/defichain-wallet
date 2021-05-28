import { useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '../store'
import { WhaleApiState } from '../store/network'

export default function useWhaleApiClient (): WhaleApiClient {
  const whale = useSelector<RootState, WhaleApiState | undefined>(state => state.network.whale)
  if (whale === undefined) {
    throw new Error('useNetwork() must be setup before using useWhaleApiClient')
  }

  return new WhaleApiClient({
    url: whale.url,
    network: whale.network
  })
}
