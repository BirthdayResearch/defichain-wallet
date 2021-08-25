import * as React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { View } from 'react-native'
import { tailwind } from '../../tailwind'

export function TransactionSkeletonLoader (): JSX.Element {
  return (
    <View
      testID='transaction_skeleton_loader'
      style={tailwind('p-2 bg-white border-b border-gray-200 w-full items-center justify-center')}
    >
      <ContentLoader
        speed={2}
        viewBox='0 0 344 47'
        width='100%'
        height={47}
        preserveAspectRatio='xMidYMid slice'
        backgroundColor='#ecebeb'
        foregroundColor='#ffffff'
      >
        <Circle cx='17' cy='23' r='10' />
        <Rect x='44' y='7' width='100' height='15' />
        <Rect x='44' y='29' width='100' height='10' />
        <Rect x='250' y='16' width='85' height='15' />
      </ContentLoader>
    </View>
  )
}
