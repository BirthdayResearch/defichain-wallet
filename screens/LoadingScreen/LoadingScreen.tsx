import * as React from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import tailwind from 'tailwind-rn'
import { View } from '../../components/Themed'
import { translate } from '../../translations'
import { StyleSheet } from 'react-native'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen (props: LoadingScreenProps): JSX.Element {
  const { message } = props
  const loadingMessage = message ?? translate('screens/LoadingScreen', 'Loading')
  return (
    <View style={[styles.loaderContainer, tailwind('bg-white')]}>
      <Spinner
        color='#5b10ff'
        overlayColor='rgba(255, 255, 255, 1)'
        visible
        textContent={loadingMessage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    height: '100%',
    width: '100%',
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
