// import { MaterialIcons } from '@expo/vector-icons'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
// import NumberFormat from 'react-number-format'
// import { useDispatch, useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Text, View } from '../../../../components'
// import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { SectionTitle } from '../../../../components/SectionTitle'
// import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
// import { fetchTokens, useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
// import { RootState } from '../../../../store'
import { ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { MasternodeParamList } from './MasternodesNavigator'
import { masternode } from '@defichain/jellyfish-api-core'
import { EmptyMasternode } from './EmptyMasternode'
import { Button } from '../../../../components/Button'

type Props = StackScreenProps<MasternodeParamList, 'MasternodesScreen'>

export interface Masternode {
  id: string
  ownerAuthAddress: string
  operatorAuthAddress: string
  creationHeight: number
  resignHeight: number
  state: masternode.MasternodeState
  mintedBlocks: number
}

const masternodes: Masternode[] = [{
  id: 'cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff',
  ownerAuthAddress: '8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r',
  operatorAuthAddress: '8a4HMKno7Q1iQQ74KvDviSgm9j624fMban',
  creationHeight: 686464,
  resignHeight: 798137,
  state: masternode.MasternodeState.RESIGNED,
  mintedBlocks: 9
}, {
  id: '800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff',
  ownerAuthAddress: '8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7',
  operatorAuthAddress: '8NVmNENzYjmfHJSUygVY2QiK1fVUNEvfUo',
  creationHeight: 3732,
  resignHeight: 685321,
  state: masternode.MasternodeState.ENABLED,
  mintedBlocks: 1992
}]

// const masternodes: any = []

export function MasternodesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  // const client = useWhaleApiClient()
  // const address = useSelector((state: RootState) => state.wallet.address)
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    // await fetchMasternodes(client, address, dispatch)
    setRefreshing(false)
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={masternodes}
      renderItem={({ item }) =>
        <MasternodeItemRow
          masternode={item} key={item.id}
          onPress={() => navigation.navigate('MasternodeDetail', { masternode: item })}
        />}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      ListHeaderComponent={<SectionTitle testID='masternodes_title' text={translate('screens/MasternodesScreen', 'MASTERNODE DETAILS')} />}
      ListFooterComponent={<Button testID='button_create_masternode' title='Create Masternode' onPress={() => navigation.navigate('Create')} label={translate('screens/MasternodesScreen', 'CREATE MASTERNODE')} />}
    />
  )
}

function MasternodeItemRow (
  { masternode, onPress }: { masternode: Masternode, onPress: () => void }
): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress} testID={`masternodes_row_${masternode.id}`}
      style={tailwind('bg-white py-4 pl-4 pr-2 flex-row justify-between items-center')}
    >
      <View>
        {renderField('Owner', masternode.ownerAuthAddress)}
        {renderField('Operator', masternode.operatorAuthAddress)}
        {renderField('State', masternode.state)}
      </View>
    </TouchableOpacity>
  )
}

function renderField (key: string, value: string): JSX.Element {
  return (
    <View style={tailwind('flex-row items-start')}>
      <View style={tailwind('w-20 text-right pr-2')}>
        <Text style={tailwind('text-sm mb-1 font-semibold')}>{key}: </Text>
      </View>
      <View style={tailwind('flex flex-1')}>
        <Text style={tailwind('text-sm mb-1 break-all')}>{value}</Text>
      </View>
    </View>
  )
}
