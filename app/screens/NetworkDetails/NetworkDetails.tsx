import { useNetworkContext } from '@contexts/NetworkContext'
import { RootState } from '@store'
import React from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { View } from '../../components'
import { ThemedText, ThemedSectionTitle, ThemedSectionList, ThemedScrollView } from '../../components/themed'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

enum NETWORK {
  ConnectedStatus = 'YOU ARE CURRENTLY CONNECTED TO',
  NetworkDetails = 'NETWORK DETAILS'
}

interface StatItemProps {
  label: string
  status: string
  statusIcon?: JSX.Element
  testID: string
}

export function formatTime (date: string): string {
  return dayjs(date).format('MMM D, h:mm a')
}

export const NetworkDetails = (): JSX.Element | null => {
  const { connected, count: blockCount, masterNodeCount, lastSync } = useSelector((state: RootState) => state.block)

  const { network } = useNetworkContext()

  const statsData = [
    {
      key: NETWORK.ConnectedStatus,
      data: [
        {
          label: translate('screens/NetworkDetails', 'Network'),
          status: network,
          testID: 'network'
        }, {
          label: translate('screens/NetworkDetails', 'Status'),
          status: translate('screens/NetworkDetails', connected ? 'Connected' : 'Disconnected'),
          testID: 'status',
          statusIcon: (
            <View
              style={tailwind(`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`)}
              testID='status_icon_network'
            />)
        }
      ]
    }, {
      key: NETWORK.NetworkDetails,
      data: [
        {
          label: translate('screens/NetworkDetails', 'Last Sync'),
          status: (lastSync != null) ? formatTime(lastSync) : '',
          testID: 'last_sync'
        }, {
          label: translate('screens/NetworkDetails', 'Block Height'),
          status: blockCount,
          testID: 'block_height'
        }, {
          label: translate('screens/NetworkDetails', 'Total Masternode'),
          status: masterNodeCount,
          testID: 'total_masterenode'
        }
      ]
    }
  ]

  return (
    <ThemedSectionList
      keyExtractor={(item: StatItemProps, index: number) => `${index}`}
      renderItem={({ item }): JSX.Element => {
       return <StatItemRow {...item} />
      }}
      renderSectionHeader={({ section }) => {
        switch (section.key) {
          case NETWORK.ConnectedStatus:
            return (
              <ThemedSectionTitle
                testID='network_detail_title'
                text={translate('screens/NetworkDetails', section.key)}
              />
            )
          case NETWORK.NetworkDetails:
            return (
              <ThemedSectionTitle
                testID={section.key}
                text={translate('screens/NetworkDetails', section.key)}
              />
            )
          default:
            return <></>
        }
      }}
      sections={statsData}
      testID='liquidity_screen_list'
    />
  )
}

function StatItemRow ({ label, status, testID, statusIcon }: StatItemProps): JSX.Element {
  return (
    <ThemedScrollView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      contentContainerStyle={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
    >
      <ThemedText
        dark={tailwind('text-gray-200')}
        light={tailwind('text-black')}
        style={tailwind('font-medium')}
        testID={`${testID}_label`}
      >
        {label}
      </ThemedText>

      <View style={tailwind('flex-row items-center')}>
        {statusIcon}
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-600')}
          style={tailwind('text-sm font-medium text-gray-600')}
          testID={`${testID}_value`}
        >
          {status}
        </ThemedText>
      </View>
    </ThemedScrollView>
  )
}
