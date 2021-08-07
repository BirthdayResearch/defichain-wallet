import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import { Text, View } from '../../../../components'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
// import { RootState } from '../../../../store'
import { ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { MasternodeParamList } from './MasternodesNavigator'
import { masternode } from '@defichain/jellyfish-api-core'
import { EmptyMasternode } from './EmptyMasternode'
import { Button } from '../../../../components/Button'
import { ApiPagedResponse } from '@defichain/whale-api-client'
import { MasternodeData } from '@defichain/whale-api-client/dist/api/masternodes'
import { Logging } from '../../../../api'

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

const masternodes: Masternode[] = [{
  id: 'cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff',
  ownerAuthAddress: '8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r',
  operatorAuthAddress: '8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r',
  state: masternode.MasternodeState.RESIGNED,
  localMasternode: false,
  mintedBlocks: 9,
  creationHeight: 686464,
  resignHeight: 798137,
  resignTx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc',
  banTx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc',
  ownerIsMine: true,
  operatorIsMine: true
}, {
  id: '800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff',
  ownerAuthAddress: '8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7',
  operatorAuthAddress: '8NVmNENzYjmfHJSUygVY2QiK1fVUNEvfUo',
  state: masternode.MasternodeState.ENABLED,
  localMasternode: true,
  mintedBlocks: 1992,
  creationHeight: 3732,
  resignHeight: 685321,
  resignTx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc',
  banTx: '65db422f652f4d9079228db8446e03879fec9bba1675d1b80acca3cbf88458cc',
  ownerIsMine: true,
  operatorIsMine: true
}]

// const masternodes: any = []

export function MasternodesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const [refreshing, setRefreshing] = useState(false)
  // const [masternodes, setMasternodes] = useState<Masternode[]>([])
  const [nextToken, setNextToken] = useState<string | undefined>(undefined)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height])

  const onRefresh = useCallback(async () => {
    console.log('onRefresh')
    setRefreshing(true)
    try {
      const response: ApiPagedResponse<MasternodeData> = await client.masternodes.list(30, nextToken)
      console.log('response: ', response)
      setNextToken(response.nextToken)
    } catch (err) {
      Logging.error(err)
    }

    setRefreshing(false)
  }, [])

  useEffect(() => {

  }, [])

  return masternodes.length === 0
    ? <EmptyMasternode navigation={navigation} refreshing={refreshing} onRefresh={onRefresh} />
    : renderMasternodes(navigation, refreshing, onRefresh)
}

function renderMasternodes (
  navigation: StackNavigationProp<MasternodeParamList, 'MasternodesScreen'>, refreshing: boolean, onRefresh: () => Promise<void>
): JSX.Element {
  return (
    <FlatList
      testID='masternodes_list'
      style={tailwind('bg-gray-100')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      data={masternodes}
      renderItem={({ item }) =>
        <MasternodeItemRow
          masternode={item} key={item.id}
          onPress={() => navigation.navigate('MasternodeDetail', { masternode: item })}
        />}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      ListHeaderComponent={<SectionTitle testID='masternodes_title' text={translate('screens/MasternodesScreen', 'MASTERNODE LIST')} />}
      ListFooterComponent={<Button testID='button_create_masternode' title='Create Masternode' onPress={() => navigation.navigate('MasternodeCreate')} label={translate('screens/MasternodesScreen', 'CREATE MASTERNODE')} />}
    />
  )
}

function MasternodeItemRow (
  { masternode, onPress }: { masternode: Masternode, onPress: () => void }
): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress} testID={`masternodes_row_${masternode.id}`}
      style={tailwind('bg-white pt-4 pb-4 flex-row justify-between items-center')}
    >
      <View style={tailwind('w-full')}>
        {renderField(masternode.id, 'Owner', masternode.ownerAuthAddress)}
        {renderField(masternode.id, 'Operator', masternode.operatorAuthAddress === masternode.ownerAuthAddress ? 'Same as owner' : masternode.operatorAuthAddress)}
        {renderField(masternode.id, 'State', masternode.state)}
        {renderField(masternode.id, 'Type', masternode.localMasternode ? 'Local' : 'Remote')}
      </View>
    </TouchableOpacity>
  )
}

function renderField (id: string, key: string, value: string): JSX.Element {
  return (
    <View style={tailwind('flex-row items-start')} testID={`masternodes_row_${id}_${key}`}>
      <View style={tailwind('w-3/12 text-right pr-3')}>
        <Text style={tailwind('text-sm mb-1 font-semibold')}>{key}: </Text>
      </View>
      <View style={tailwind('w-9/12 pr-3')}>
        <Text style={tailwind('text-sm mb-1 break-words')}>{value}</Text>
      </View>
    </View>
  )
}
