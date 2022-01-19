import { StackScreenProps } from '@react-navigation/stack'
import { BarCodeScanner as DefaultBarCodeScanner } from 'expo-barcode-scanner'
import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import tailwind from 'tailwind-rn'
import { View } from '.'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { translate } from '@translations'
import { ThemedText } from './themed'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

type Props = StackScreenProps<BalanceParamList, 'BarCodeScanner'>

export function BarCodeScanner ({
  route,
  navigation
}: Props): JSX.Element {
  // null => undetermined
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [value, setValue] = useState<string>()
  const logger = useLogger()

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
      .catch(logger.error)
  }, [])

  if (hasPermission === null) {
    return (
      <View style={tailwind('flex-col flex-1 justify-center items-center')}>
        <ThemedText>
          {translate('components/BarCodeScanner', 'Requesting for camera permission')}
        </ThemedText>
      </View>
    )
  }
  if (!hasPermission) {
    return (
      <View style={tailwind('flex-col flex-1 justify-center items-center')}>
        <ThemedText>
          {translate('components/BarCodeScanner', 'You have denied the permission request to use your camera')}
        </ThemedText>
      </View>
    )
  }

  const opacity = 'rgba(0, 0, 0, .6)'
  const styles = StyleSheet.create({
    focused: {
      flex: 5
    },
    layerBottom: {
      backgroundColor: opacity,
      flex: 2
    },
    layerCenter: {
      flex: 3,
      // aspectRatio: 1,
      flexDirection: 'row'
    },
    layerLeft: {
      backgroundColor: opacity,
      flex: 1
    },
    layerRight: {
      backgroundColor: opacity,
      flex: 1
    },
    layerTop: {
      backgroundColor: opacity,
      flex: 2
    }
  })

  return (
    <>
      <DefaultBarCodeScanner
        barCodeTypes={[DefaultBarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={(e) => {
          setValue(e.data)
        }}
        style={tailwind('flex-1 absolute inset-0')}
      />

      <View style={styles.layerTop} />

      <View style={styles.layerCenter}>
        <View style={styles.layerLeft} />

        <View style={[styles.focused, tailwind('relative')]}>
          <View style={tailwind('border-t-4 border-l-4 border-white w-16 h-16 absolute')} />

          <View style={tailwind('border-t-4 border-r-4 border-white w-16 h-16 top-0 right-0 absolute')} />

          <View style={tailwind('border-b-4 border-l-4 border-white w-16 h-16 bottom-0 absolute')} />

          <View style={tailwind('border-b-4 border-r-4 border-white w-16 h-16 bottom-0 right-0 absolute')} />
        </View>

        <View style={styles.layerRight} />
      </View>

      <View style={styles.layerBottom} />
    </>
  )
}
