import { useNetworkContext } from '@contexts/NetworkContext'
import { RootState } from '@store'
import React from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { View } from '../../../../../components'
import { ThemedText, ThemedSectionTitle, ThemedScrollView, ThemedView } from '../../../../../components/themed'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { TextRow } from '@components/TextRow'
import { NumberRow } from '@components/NumberRow'

export function NetworkDetails (): JSX.Element {
  const { network } = useNetworkContext()
  const { connected, count: blockCount, masternodeCount, lastSync } = useSelector((state: RootState) => state.block)
  const syncFormattedDate = (lastSync != null) ? dayjs(lastSync).format('MMM D, h:mm a') : ''

  return (
    <ThemedScrollView testID='network_details'>

      <ThemedSectionTitle
        testID='current_connection_detail_title'
        text={translate('screens/NetworkDetails', 'YOU ARE CURRENTLY CONNECTED TO')}
      />

      <TextRow
        lhs={translate('screens/NetworkDetails', 'Network')}
        rhs={{ value: network, testID: 'network' }}
      />

      <NetworkStatusRow connected={connected} />

      <ThemedSectionTitle
        testID='network_detail_title'
        text={translate('screens/NetworkDetails', 'NETWORK DETAILS')}
      />

      <TextRow
        lhs={translate('screens/NetworkDetails', 'Last synced')}
        rhs={{ value: syncFormattedDate, testID: 'last_sync' }}
      />

      <NumberRow
        lhs={translate('screens/NetworkDetails', 'Block height')}
        rightHandElements={[{ value: blockCount ?? '', testID: 'block_height' }]}
      />

      <NumberRow
        lhs={translate('screens/NetworkDetails', 'Total masternodes')}
        rightHandElements={[{ value: masternodeCount ?? '', testID: 'total_masternodes' }]}
      />
    </ThemedScrollView>
  )
}

function NetworkStatusRow ({ connected }: {connected: boolean}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row p-4 items-center justify-between w-full')}
    >
      <ThemedText style={tailwind('font-medium')}>
        {translate('screens/NetworkDetails', 'Status')}
      </ThemedText>

      <ThemedView
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('flex-row items-center')}
      >
        <View
          style={tailwind(`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`)}
          testID='status_icon_network'
        />
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('font-medium text-right')}
          testID='status_value'
        >
          {translate('screens/NetworkDetails', connected ? 'Connected' : 'Disconnected')}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  )
}
