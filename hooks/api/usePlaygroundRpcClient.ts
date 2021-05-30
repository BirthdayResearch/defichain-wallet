import { useSelector } from 'react-redux'
import { PlaygroundApiClient, PlaygroundRpcClient } from '@defichain/playground-api-client'
import { RootState } from '../../store'
import { PlaygroundApiState } from '../../store/network'

export function usePlaygroundRpcClient (): PlaygroundRpcClient {
  const playground = useSelector<RootState, PlaygroundApiState | undefined>(state => state.network.playground)

  if (playground === undefined) {
    throw new Error('useNetwork() === true, hooks must be called before usePlaygroundRpcClient()')
  }

  const client = new PlaygroundApiClient({
    url: playground.url
  })
  return new PlaygroundRpcClient(client)
}
