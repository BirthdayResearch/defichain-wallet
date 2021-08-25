import { StackScreenProps } from '@react-navigation/stack'
import { BarCodeScanner as DefaultBarCodeScanner } from 'expo-barcode-scanner'
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import tailwind from 'tailwind-rn'
import { View } from '.'
import { Logging } from '../api/logging'
import { Text } from '../components/Text'
import { BalanceParamList } from '../screens/AppNavigator/screens/Balances/BalancesNavigator'
import { translate } from '../translations'

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
        <Text>{translate('components/BarCodeScanner', 'Requesting for camera permission')}</Text>
      </View>
    )
  }
  if (!hasPermission) {
    return (
      <View style={tailwind('flex-col flex-1 justify-center items-center')}>
        <Text>{translate('components/BarCodeScanner', 'You have denied the permission request to use your camera')}</Text>
      </View>
    )
  }

  const opacity = 'rgba(0, 0, 0, .6)'
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column'
    },
    layerTop: {
      flex: 2,
      backgroundColor: opacity
    },
    layerCenter: {
      flex: 3,
      // aspectRatio: 1,
      flexDirection: 'row'
    },
    layerLeft: {
      flex: 1,
      backgroundColor: opacity
    },
    focused: {
      flex: 5
    },
    layerRight: {
      flex: 1,
      backgroundColor: opacity
    },
    layerBottom: {
      flex: 2,
      backgroundColor: opacity
    }
  })

  return (
    <>
      <DefaultBarCodeScanner
        style={tailwind('flex-1 absolute inset-0')}
        barCodeTypes={[DefaultBarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={(e) => { setValue(e.data) }}
      />
      <View style={styles.layerTop} />
      <View style={styles.layerCenter}>
        <View style={styles.layerLeft} />
        <View style={[styles.focused, tailwind('relative')]}>
          <View style={tailwind('border-t-4 border-l-4 border-white w-12 h-12 absolute')} />
          <View style={tailwind('border-t-4 border-r-4 border-white w-12 h-12 top-0 right-0 absolute z-50')} />
          <View style={tailwind('border-b-4 border-l-4 border-white w-12 h-12 bottom-0 absolute z-50')} />
          <View style={tailwind('border-b-4 border-r-4 border-white w-12 h-12 bottom-0 right-0 absolute z-50')} />
        </View>
        <View style={styles.layerRight} />
      </View>
      <View style={styles.layerBottom} />
    </>
  )
}
