import * as React from 'react'
import { getEnvironment } from '../../../../../environment'
import { RowNetworkItem } from '../components/RowNetworkItem'

export function NetworkSelectionScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <>
      {
        networks.map((network, index) => (
          <RowNetworkItem key={index} network={network} />
        ))
      }
    </>
  )
}
