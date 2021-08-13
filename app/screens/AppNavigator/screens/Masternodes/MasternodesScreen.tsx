import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import { Text, View } from '../../../../components'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { MasternodeParamList } from './MasternodesNavigator'
import { masternode } from '@defichain/jellyfish-api-core'
import { EmptyMasternode } from './EmptyMasternode'
import { Button } from '../../../../components/Button'
// import { ApiPagedResponse } from '@defichain/whale-api-client'
import { MasternodeData } from '@defichain/whale-api-client/dist/api/masternodes'
import { Logging } from '../../../../api'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import BigNumber from 'bignumber.js'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { useNetworkContext } from '../../../../contexts/NetworkContext'

type Props = StackScreenProps<MasternodeParamList, 'MasternodesScreen'>

export interface Masternode {
  id: string
  ownerAuthAddress: string
  operatorAuthAddress: string
  state: masternode.MasternodeState
  localMasternode: boolean
  mintedBlocks: number
  creationHeight: number
  resignHeight: number
  resignTx: string
  banTx: string
  ownerIsMine: boolean
  operatorIsMine: boolean
}

const masternodes: any[] = [{
  id: 'cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff',
  owner: {
    address: '8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r'
  },
  operator: {
    address: '8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r'
  },
  state: masternode.MasternodeState.RESIGNED,
  local: false,
  mintedBlocks: 9,
  creation: {
    height: 686464
  },
  resign: {
    height: 798137,
    tx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc'
  },
  banTx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc',
  isMine: {
    owner: true,
    operator: true
  }
}, {
  id: '800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff',
  owner: {
    address: '8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7'
  },
  operator: {
    address: '8NVmNENzYjmfHJSUygVY2QiK1fVUNEvfUo'
  },
  state: masternode.MasternodeState.ENABLED,
  local: true,
  mintedBlocks: 1992,
  creation: {
    height: 3732
  },
  resign: {
    height: 685321,
    tx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc'
  },
  banTx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc',
  isMine: {
    owner: true,
    operator: true
  }
}]

export function MasternodesScreen ({ navigation }: Props): JSX.Element {
  const client = useWhaleApiClient()
  const [refreshing, setRefreshing] = useState(false)
  // const [masternodes, setMasternodes] = useState<MasternodeData[]>([])
  // const [hasNext, setHasNext] = useState<boolean>(false)
  // const [nextToken, setNextToken] = useState<string | undefined>(undefined)
  const [canCreate, setCanCreate] = useState(false)

  const tokens = useTokensAPI()
  console.log('tokens: ', tokens)

  const { networkName } = useNetworkContext()
  console.log('networkName: ', networkName)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    client.masternodes.list().then(response => {
      console.log('response: ', response)
      // setMasternodes(response.filter(mn => mn.isMine.owner || mn.isMine.operator))
      // setHasNext(response.hasNext)
      // setNextToken(response.nextToken)
    }).catch((error) => Logging.error(error))

    setRefreshing(false)
  }, [])

  useEffect(() => {
    onRefresh()
  }, [])

  useEffect(() => {
    setCanCreate(true)
    const utxo: AddressToken = tokens.find(token => token.id === '0_utxo') as AddressToken
    const minAcquiredBal = networkName === 'regtest' ? new BigNumber(2) : new BigNumber(20000)
    if (new BigNumber(utxo.amount).gte(minAcquiredBal)) {
      setCanCreate(true)
    } else {
      setCanCreate(false)
    }
  }, [networkName, JSON.stringify(tokens)])

  return masternodes.length === 0
    ? <EmptyMasternode navigation={navigation} refreshing={refreshing} onRefresh={onRefresh} />
    : renderMasternodes(masternodes, navigation, refreshing, onRefresh, canCreate)
}

function renderMasternodes (
  masternodes: MasternodeData[],
  navigation: StackNavigationProp<MasternodeParamList, 'MasternodesScreen'>,
  refreshing: boolean,
  onRefresh: () => void,
  canCreate: boolean
): JSX.Element {
  return (
    <FlatList
      testID='masternodes_list'
      style={tailwind('bg-gray-100')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      data={masternodes}
      renderItem={({ item, index }) =>
        <MasternodeItemRow
          masternode={item} index={index} key={item.id}
          onPress={() => navigation.navigate('MasternodeDetail', { masternode: item })}
        />}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      ListHeaderComponent={<SectionTitle testID='masternodes_title' text={translate('screens/MasternodesScreen', 'MASTERNODE LIST')} />}
      ListFooterComponent={<CreateButton navigation={navigation} canCreate={canCreate} />}
    />
  )
}

function CreateButton (
  props: {
    navigation: StackNavigationProp<MasternodeParamList, 'MasternodesScreen'>
    canCreate: boolean
  }
): JSX.Element {
  return (
    <View style={tailwind('flex justify-center')}>
      <Button
        testID='button_create_masternode'
        title='Create Masternode'
        disabled={!props.canCreate}
        onPress={
          () => props.navigation.navigate('MasternodeCreate')
        }
        label={translate('screens/MasternodesScreen', 'CREATE MASTERNODE')}
      />
      {!props.canCreate && (
        <View testID='insufficient_bal_create_masternode' style={tailwind('p-4 pb-0')}>
          <Text style={tailwind('text-sm text-center text-primary')}>Unable to create masternode due to lack of funds. Minimum 20,000 DFI is required to create masternode.</Text>
        </View>
      )}
    </View>
  )
}

function MasternodeItemRow (
  { masternode, index, onPress }: { masternode: MasternodeData, index: number, onPress: () => void }
): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress} testID={`masternodes_row_${index}`}
      style={tailwind('bg-white pt-4 pb-4 flex-row justify-between items-center')}
    >
      <View style={tailwind('w-full')}>
        {renderField(index, 'Owner', masternode.owner.address)}
        {renderField(index, 'Operator', masternode.operator.address === masternode.owner.address ? 'Same as owner' : masternode.operator.address)}
        {renderField(index, 'State', masternode.state)}
        {/* {renderField(index, 'Type', masternode.local ? 'Local' : 'Remote')} */}
      </View>
    </TouchableOpacity>
  )
}

function renderField (index: number, key: string, value: string): JSX.Element {
  return (
    <View style={tailwind('flex-row items-start')} testID={`masternodes_row_${index}_${key}`}>
      <View style={tailwind('w-3/12 text-right pr-3')}>
        <Text style={tailwind('text-sm mb-1 font-semibold')}>{key}: </Text>
      </View>
      <View style={tailwind('w-9/12 pr-3')}>
        <Text style={tailwind('text-sm mb-1 overflow-ellipsis overflow-hidden')}>{value}</Text>
      </View>
    </View>
  )
}
