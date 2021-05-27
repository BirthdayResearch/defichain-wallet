import React from 'react'
import { StyleSheet, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { Provider } from 'react-redux'
import { store } from './store'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'

import { Playground } from './playground/Playground'

export default function App (): JSX.Element | null {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  if (!isLoadingComplete) {
    return null
  }

  return (
    <Provider store={store}>
      <View style={tailwind('flex-row flex-1 justify-center items-center bg-black')}>
        <View style={tailwind('flex-row border-2')}>
          <View style={styles.phone}>
            <Navigation colorScheme={colorScheme} />
          </View>
          <View style={[styles.phone, tailwind('bg-white ml-1')]}>
            <Playground />
          </View>
        </View>
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  phone: {
    width: 375,
    height: 667
  }
})
