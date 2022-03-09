import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import NumberFormat from 'react-number-format'
import { TouchableOpacity, Linking } from 'react-native'
import { View } from '@components/index'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { TextRow } from '@components/TextRow'
import { NumberRow } from '@components/NumberRow'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'

export function NetworkDetails (): JSX.Element {
  const { network } = useNetworkContext()
  const {
    connected,
    count: blockCount,
    masternodeCount,
    lastSuccessfulSync
  } = useSelector((state: RootState) => state.block)
  const syncFormattedDate = (lastSuccessfulSync != null) ? dayjs(lastSuccessfulSync).format('lll') : ''

  return (
    <ThemedScrollView testID='network_details'>

      <ThemedSectionTitle
        testID='network_details_current_connection'
        text={translate('screens/NetworkDetails', 'YOU ARE CURRENTLY CONNECTED TO')}
      />

      <TextRow
        lhs={translate('screens/NetworkDetails', 'Network')}
        rhs={{ value: network, testID: 'network_details_network' }}
      />

      <NetworkStatusRow connected={connected} />

      <ThemedSectionTitle
        testID='network_details_block_info'
        text={translate('screens/NetworkDetails', 'NETWORK DETAILS')}
      />

      <TextRow
        lhs={translate('screens/NetworkDetails', 'Last synced')}
        rhs={{ value: syncFormattedDate, testID: 'network_details_last_sync' }}
      />

      <BlocksInfoRow blockCount={blockCount} />

      <NumberRow
        lhs={translate('screens/NetworkDetails', 'Total Masternodes')}
        rhs={{
          value: masternodeCount ?? '',
          testID: 'network_details_total_masternodes'
        }}
        textStyle={tailwind('font-medium text-base')}
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
          testID='network_details_status_icon'
        />
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={[tailwind('font-medium text-right'), { lineHeight: 20 }]}
          testID='network_details_status_value'
        >
          {translate('screens/NetworkDetails', connected ? 'Connected' : 'Disconnected')}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

function BlocksInfoRow ({ blockCount }: {blockCount?: number}): JSX.Element {
  const { getBlocksUrl } = useDeFiScanContext()

  const onBlockUrlPressed = async (): Promise<void> => {
    if (blockCount !== undefined) {
      const url = getBlocksUrl(blockCount)
      await Linking.openURL(url)
    }
  }

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row p-4 items-center justify-between w-full')}
    >
      <ThemedText style={tailwind('font-medium')}>
        {translate('screens/NetworkDetails', 'Block height')}
      </ThemedText>
      <View style={tailwind('flex-row items-center')}>
        <TouchableOpacity
          onPress={onBlockUrlPressed}
          testID='block_detail_explorer_url'
        >
          <View style={tailwind('flex-row items-center')}>
            <NumberFormat
              decimalScale={8}
              displayType='text'
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-darkprimary-500')}
                  light={tailwind('text-primary-500')}
                  style={tailwind('flex-wrap font-medium text-right text-gray-500')}
                  testID='network_details_block_height'
                >
                  {val}
                </ThemedText>
            )}
              thousandSeparator
              value={blockCount}
            />
            <View style={tailwind('ml-2 flex-grow-0 justify-center')}>
              <ThemedIcon
                dark={tailwind('text-darkprimary-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='open-in-new'
                size={24}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}
