import React, { useState, useEffect } from 'react'
import { Text } from 'react-native'
import { BarCodeScanner as DefaultBarCodeScanner } from 'expo-barcode-scanner'
import { Logging } from '../api/logging'
import { translate } from '../translations'
import tailwind from 'tailwind-rn'
import { View } from '.'
import { StackScreenProps } from '@react-navigation/stack'
import { BalanceParamList } from '../screens/AppNavigator/screens/Balances/BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'BarCodeScanner'>

export function BarCodeScanner ({ route, navigation }: Props): JSX.Element {
  // null => undetermined
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    DefaultBarCodeScanner.requestPermissionsAsync()
      .then(({ status }) => {
        switch (status) {
          case 'granted': setHasPermission(true); break
          case 'denied': setHasPermission(false); break
        }
      })
      .catch(e => Logging.error(e))
  }, [])

  const handleBarCodeScanned = ({ data }: { type: string, data: string }): void => {
    route.params.onQrScanned(data)
    navigation.goBack()
  }

  if (hasPermission === null) {
    return (
      <View style={tailwind('flex-col flex-1 justify-center items-center')}>
        <Text>{translate('components/BarCodeScanner', 'Requesting for camera permission')}</Text>
      </View>
    )
  }
  if (!hasPermission) {
    <View style={tailwind('flex-col flex-1 justify-center items-center')}>
      <Text>{translate('components/BarCodeScanner', 'You have denied the permission request to use your camera')}</Text>
    </View>
  }

  return (
    <DefaultBarCodeScanner
      style={tailwind('flex-1')}
      onBarCodeScanned={handleBarCodeScanned}
    />
  )
}
