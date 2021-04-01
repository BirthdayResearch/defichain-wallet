import * as React from 'react'

import EditScreenInfo from '../components/EditScreenInfo'
import { Text, View } from '../components/Themed'
import tailwind from 'tailwind-rn'

export default function TabTwoScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>Tab Two</Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
      <EditScreenInfo path='/screens/TabTwoScreen.tsx' />
    </View>
  )
}
