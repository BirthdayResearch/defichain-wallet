import * as React from 'react'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { Playground } from './useDeFiPlayground'

export const Whale: {
  api?: WhaleApiClient
} = {
  api: undefined
}

export default function useDeFiWhale (): boolean {
  React.useEffect(() => {
    switch (Playground.provider) {
      case 'localhost':
        Whale.api = new WhaleApiClient({ url: 'http://localhost:19553' })
        return
      default:
        Whale.api = new WhaleApiClient({ url: 'https://ocean.defichain.com' })
    }
  })

  return true
}
