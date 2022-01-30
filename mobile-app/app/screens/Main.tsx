import { StatusBar } from 'expo-status-bar'

import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { RootNavigator } from './RootNavigator'
import { StyleSheet, View } from 'react-native'
import { theme } from '../tailwind.config'

export function Main (): JSX.Element {
  const { isLight } = useThemeContext()

  // SafeAreaProvider needs some time to load on Android
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.extend.colors.dfxblue[900],
      flex: 1
    }
  })

  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style={isLight ? 'dark' : 'light'} />
      </SafeAreaProvider>
    </View>
  )
}
