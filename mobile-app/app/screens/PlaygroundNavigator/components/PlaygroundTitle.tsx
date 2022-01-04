
import { View } from '@components/index'
import { ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { PlaygroundStatus, PlaygroundStatusProps } from './PlaygroundStatus'

interface PlaygroundTitleProps {
  title: string
  status: PlaygroundStatusProps
}

export function PlaygroundTitle (props: PlaygroundTitleProps): JSX.Element {
  return (
    <View style={tailwind('px-4 py-1 mb-1 mt-4 flex-row flex items-center')}>
      <ThemedText style={tailwind('text-lg font-semibold mr-2')}>
        {props.title}
      </ThemedText>

      <PlaygroundStatus {...props.status} />
    </View>
  )
}
