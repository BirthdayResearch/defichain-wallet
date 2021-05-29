import React from 'react'
import tailwind from 'tailwind-rn'
import { StyleSheet, View } from 'react-native'
import { Navigation } from '../navigation'
import { Playground } from '../playground/Playground'

export function Main (): JSX.Element {
  return (
    <View style={tailwind('flex-row flex-1 justify-center items-center bg-black')}>
      <View style={tailwind('flex-row border-2')}>
        <View style={styles.phone}>
          <Navigation />
        </View>
        <View style={[styles.phone, tailwind('bg-white ml-1')]}>
          <Playground />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  phone: {
    width: 375,
    height: 667
  }
})
