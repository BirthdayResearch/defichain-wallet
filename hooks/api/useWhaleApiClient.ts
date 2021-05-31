import { useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '../../store'
import { WhaleApiState } from '../../store/network'

export function useWhaleApiClient (): WhaleApiClient {
  const whale = useSelector<RootState, WhaleApiState | undefined>(state => state.network.whale)

  if (whale === undefined) {
    throw new Error('useNetwork() === true, hooks must be called before useWhaleApiClient()')
  }

  return new WhaleApiClient({
    url: whale.url,
    network: whale.network
  })
}
