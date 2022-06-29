import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import NumberFormat from 'react-number-format'
import { TouchableOpacity, Linking } from 'react-native'
import { View } from '@components/index'
import { ThemedIcon, ThemedText, ThemedTextV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { ThemedSectionTitleV2 } from '@components/themed/ThemedSectionTitleV2'
import { TextRowV2 } from '@components/TextRowV2'
import { NumberRowV2 } from '@components/NumberRowV2'
import { ThemedViewV2 } from '@components/themed/ThemedViewV2'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletParamListV2 } from '@screens/WalletNavigator/WalletNavigator'
import { getEnvironment } from '@environment'
import { getReleaseChannel } from '@api/releaseChannel'
import { NetworkItemRowV2 } from '@components/NetworkItemRowV2'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'

type Props = StackScreenProps<WalletParamListV2, 'NetworkDetails'>

export function NetworkDetailsV2 ({ route }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const networks = getEnvironment(getReleaseChannel()).networks
  const { isSelectNetwork } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const {
    connected,
    count: blockCount,
    masternodeCount,
    lastSuccessfulSync
  } = useSelector((state: RootState) => state.block)
  const syncFormattedDate = (lastSuccessfulSync != null) ? dayjs(lastSuccessfulSync).format('lll') : ''

  return (
    <ThemedViewV2
      testID='network_details'
      style={tailwind('px-5 flex-1')}
    >

      <ThemedSectionTitleV2
        testID={isSelectNetwork === true ? 'onboarding_network_selection_screen_title' : 'network_details_current_connection'}
        text={isSelectNetwork === true ? translate('screens/OnboardingNetworkSelectScreen', 'NETWORK') : translate('screens/NetworkDetails', 'CONNECTION')}
      />

      <ThemedViewV2
        style={[tailwind('px-5'), { borderRadius: 10 }]}
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
      >
        {
          isSelectNetwork === true
? (
            networks.map((network, index) => (
              <NetworkItemRowV2
                key={index}
                network={network}
                alertMessage={translate(
                  'screens/OnboardingNetworkSelectScreen', 'You are about to switch to {{network}}. Do you want to proceed?', { network: network }
                )}
                isLast={index === networks.length - 1}
              />
            ))
          )
: (
  <>
    <TextRowV2
      lhs={{ value: translate('screens/NetworkDetails', 'Network') }}
      rhs={{ value: network, testID: 'network_details_network' }}
      containerStyle={{
                  style: tailwind('pt-5 pb-4.5 border-b flex-row items-start w-full bg-transparent'),
                  light: tailwind('border-mono-light-v2-300'),
                  dark: tailwind('border-mono-dark-v2-300')
                }}
    />
    <NetworkStatusRow connected={connected} />
  </>
          )
        }
      </ThemedViewV2>
      {(hasPendingJob || hasPendingBroadcastJob) &&
        (
          <ThemedTextV2
            style={tailwind('pt-1.5 pb-2 px-5 text-xs font-normal-v2')}
            light={tailwind('text-orange-v2')}
            dark={tailwind('text-orange-v2')}
          >
            {translate('screens/OnboardingNetworkSelectScreen', 'Network selection is currently unavailable due to ongoing transaction')}
          </ThemedTextV2>
        )}

      <ThemedSectionTitleV2
        testID='network_details_block_info'
        text={translate('screens/NetworkDetails', 'DETAILS')}
      />

      <ThemedViewV2
        style={[tailwind('p-5'), { borderRadius: 10 }]}
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
      >

        <TextRowV2
          lhs={{ value: translate('screens/NetworkDetails', 'Last synced') }}
          rhs={{ value: syncFormattedDate, testID: 'network_details_last_sync' }}
          containerStyle={{
            style: tailwind('pb-4.5 border-b flex-row items-start w-full bg-transparent'),
            light: tailwind('border-mono-light-v2-300'),
            dark: tailwind('border-mono-dark-v2-300')
          }}
        />

        <BlocksInfoRow blockCount={blockCount} />

        <NumberRowV2
          lhs={{
            value: translate('screens/NetworkDetails', 'Total masternodes'),
            testID: 'network_details_total_masternodes'
          }}
          rhs={{
            value: masternodeCount ?? '',
            testID: 'network_details_total_masternodes'
          }}
          containerStyle={{
            style: tailwind('pt-4.5 flex-row items-start w-full bg-transparent'),
            light: tailwind('bg-transparent'),
            dark: tailwind('bg-transparent')
          }}
        />
      </ThemedViewV2>
    </ThemedViewV2>
  )
}

function NetworkStatusRow ({ connected }: { connected: boolean }): JSX.Element {
  return (
    <View
      style={tailwind('pt-4.5 pb-5 flex-row items-start w-full bg-transparent')}
    >
      <View style={tailwind('w-5/12')}>
        <ThemedText
          style={tailwind('text-sm font-normal-v2')}
          light={tailwind('text-mono-light-v2-900')}
          dark={tailwind('text-mono-dark-v2-900')}
        >
          {translate('screens/NetworkDetails', 'Status')}
        </ThemedText>
      </View>

      <View
        style={tailwind('flex-row justify-end flex-1')}
      >
        <ThemedText
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          style={[tailwind('text-sm font-normal-v2 mr-2'), { lineHeight: 20 }]}
          testID='network_details_status_value'
        >
          {translate('screens/NetworkDetails', connected ? 'Connected' : 'Disconnected')}
        </ThemedText>
        {connected
          ? (
            <ThemedIcon
              size={18}
              name='check-circle'
              iconType='MaterialCommunityIcons'
              light={tailwind('text-green-v2')}
              dark={tailwind('text-green-v2')}
            />
          )
          : (
            <ThemedIcon
              size={18}
              name='close-circle'
              iconType='MaterialCommunityIcons'
              light={tailwind('text-red-v2')}
              dark={tailwind('text-red-v2')}
            />
          )}
      </View>
    </View>
  )
}

function BlocksInfoRow ({ blockCount }: { blockCount?: number }): JSX.Element {
  const { getBlocksUrl } = useDeFiScanContext()

  const onBlockUrlPressed = async (): Promise<void> => {
    if (blockCount !== undefined) {
      const url = getBlocksUrl(blockCount)
      await Linking.openURL(url)
    }
  }

  return (
    <ThemedViewV2
      style={tailwind('flex-row items-start w-full bg-transparent py-4.5 border-b')}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
    >
      <View style={tailwind('w-5/12')}>
        <ThemedText
          style={tailwind('font-normal-v2 text-sm')}
          light={tailwind('text-mono-light-v2-900')}
          dark={tailwind('text-mono-dark-v2-900')}
        >
          {translate('screens/NetworkDetails', 'Block height')}
        </ThemedText>
      </View>

      <View
        style={tailwind('flex-1')}
      >
        <TouchableOpacity
          onPress={onBlockUrlPressed}
          testID='block_detail_explorer_url'
        >
          <View style={tailwind('flex-row items-center justify-end')}>
            <NumberFormat
              displayType='text'
              renderText={(val: string) => (
                <ThemedText
                  light={tailwind('text-mono-light-v2-700')}
                  dark={tailwind('text-mono-dark-v2-700')}
                  style={tailwind('text-sm font-normal-v2 flex-wrap text-right')}
                  testID='network_details_block_height'
                >
                  {val}
                </ThemedText>
              )}
              thousandSeparator
              value={blockCount}
            />
            <View style={tailwind('ml-1 flex-grow-0 justify-center')}>
              <ThemedIcon
                iconType='MaterialIcons'
                light={tailwind('text-mono-light-v2-700')}
                dark={tailwind('text-mono-dark-v2-700')}
                name='open-in-new'
                size={16}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedViewV2>
  )
}
