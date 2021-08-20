import * as React from 'react'
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'
import { View } from 'react-native'
import { tailwind } from '../../../../../tailwind'

export function DexSkeletonLoader (): JSX.Element {
  return (
    <View
      testID='dex_skeleton_loader'
      style={tailwind('p-4 bg-white border-b border-gray-200 w-full items-center justify-center')}
    >
      <ContentLoader
        speed={2}
        viewBox='0 0 328 130'
        width='100%'
        height={130}
        preserveAspectRatio='xMidYMid slice'
        backgroundColor='#ecebeb'
        foregroundColor='#ffffff'
      >
        <Circle cx='17' cy='23' r='16' />
        <Rect x='50' y='13' width='100' height='20' />

        <Rect x='0' y='55' width='100' height='15' />
        <Rect x='210' y='55' width='150' height='15' />

        <Rect x='0' y='80' width='100' height='15' />
        <Rect x='210' y='80' width='150' height='15' />

        <Rect x='0' y='105' width='100' height='15' />
        <Rect x='210' y='105' width='150' height='15' />

      </ContentLoader>
    </View>
  )
}
