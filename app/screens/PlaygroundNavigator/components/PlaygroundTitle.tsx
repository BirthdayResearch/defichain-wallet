import React from 'react'
import { Text, View } from '../../../components'
import { tailwind } from '../../../tailwind'
import { PlaygroundStatus, PlaygroundStatusProps } from './PlaygroundStatus'

interface PlaygroundTitleProps {
  title: string
  status: PlaygroundStatusProps
}

export function PlaygroundTitle (props: PlaygroundTitleProps): JSX.Element {
  return (
    <View style={tailwind('px-4 py-1 mb-1 mt-4 flex-row flex items-center')}>
      <Text style={tailwind('text-lg font-semibold mr-2')}>
        {props.title}
      </Text>
      <PlaygroundStatus {...props.status} />
    </View>
  )
}
