import { PlaygroundApiClient } from '@defichain/playground-api-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from 'redux'
import { network, NetworkName, PlaygroundApiState } from '../../store/network'

export function useNetwork (): boolean {
  const dispatch = useDispatch()

  const [isLoaded, setLoaded] = useState(false)

  // TODO(fuxingloh): maybe should change to useMemo to only recompute if Network changed
  useEffect(() => {
    loadNetwork(dispatch).finally(() => {
      setLoaded(true)
    })
  })

  return isLoaded
}

async function loadNetwork (dispatch: Dispatch<any>): Promise<void> {
  const name = await loadNetworkName()

  if (name === 'playground') {
    const playground = await loadPlayground()
    dispatch(network.actions.setPlayground(playground))
    dispatch(network.actions.setWhale({
      url: playground.url,
      network: 'regtest'
    }))
  } else {
    dispatch(network.actions.setWhale({
      url: 'https://ocean.defichain.com',
      network: name
    }))
  }
}

async function loadNetworkName (): Promise<NetworkName> {
  const name: string | null = await AsyncStorage.getItem('NETWORK_NAME')
  switch (name) {
    case 'mainnet':
    case 'testnet':
    case 'regtest':
    case 'playground':
      return name
    default:
      return 'playground'
  }

  // TODO(fuxingloh): check build so that only mainnet can be loaded in production build
}

async function loadPlayground (): Promise<PlaygroundApiState> {
  try {
    const url = 'http://localhost:19553'
    const api = new PlaygroundApiClient({ url })
    await api.playground.info()
    return { url, environment: 'localhost' }
  } catch (err) {
  }

  // Always fallback to playground.defichain.com even if it's not available
  return { url: 'https://playground.defichain.com', environment: 'remote' }
}
