import { StackScreenProps } from '@react-navigation/stack'
import { BarCodeScanner as DefaultBarCodeScanner } from 'expo-barcode-scanner'
import React, { useEffect, useState } from 'react'
import tailwind from 'tailwind-rn'
import { View } from '.'
import { Logging } from '../api'
import { BalanceParamList } from '../screens/AppNavigator/screens/Balances/BalancesNavigator'
import { translate } from '../translations'
import { ThemedText } from './themed'

type Props = StackScreenProps<BalanceParamList, 'BarCodeScanner'>

export function BarCodeScanner ({ route, navigation }: Props): JSX.Element {
  // null => undetermined
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [value, setValue] = useState<string>()

  // to ensure callback only can be fired once as value change
  useEffect(() => {
    if (value !== undefined) {
      route.params.onQrScanned(value)
      navigation.pop()
    }
  }, [value])

  useEffect(() => {
    DefaultBarCodeScanner.requestPermissionsAsync()
      .then(({ status }) => {
        switch (status) {
          case 'granted':
            setHasPermission(true)
            break
          case 'denied':
            setHasPermission(false)
            break
        }
      })
      .catch(e => Logging.error(e))
  }, [])

  if (hasPermission === null) {
    return (
      <View style={tailwind('flex-col flex-1 justify-center items-center')}>
        <ThemedText>{translate('components/BarCodeScanner', 'Requesting for camera permission')}</ThemedText>
      </View>
    )
  }
  if (!hasPermission) {
    return (
      <View style={tailwind('flex-col flex-1 justify-center items-center')}>
        <ThemedText>{translate('components/BarCodeScanner', 'You have denied the permission request to use your camera')}</ThemedText>
      </View>
    )
  }

  return (
    <DefaultBarCodeScanner
      style={tailwind('flex-1')}
      barCodeTypes={[DefaultBarCodeScanner.Constants.BarCodeType.qr]}
      onBarCodeScanned={(e) => {
        setValue(e.data)
      }}
    />
  )
}
