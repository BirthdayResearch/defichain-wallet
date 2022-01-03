import { View } from '@components'
import { IconButton } from '@components/IconButton'
import { IconType, ThemedScrollView } from '@components/themed'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

import { StyleProp, ViewStyle } from 'react-native'

interface ScrollableButtonProps {
  buttons: ScrollButton[]
  containerStyle?: StyleProp<ViewStyle>
}

export interface ScrollButton {
  label: string
  iconType?: IconType
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name']
  disabled?: boolean
  handleOnPress: () => void
  testID?: string
}

export function ScrollableButton (props: ScrollableButtonProps): JSX.Element | null {
  if (props.buttons.length === 0) {
    return null
  }

  return (
    <View
      style={tailwind('h-8')}
    >
      <ThemedScrollView
        contentContainerStyle={props.containerStyle}
        horizontal
        showsHorizontalScrollIndicator={false}
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        style={tailwind('flex flex-row')}
      >
        {props.buttons.map(button => (
          <IconButton
            key={button.label}
            iconLabel={translate('components/ScrollableButton', button.label)}
            iconType={button.iconType}
            iconName={button.iconName}
            style={tailwind('mr-2 p-2')}
            disabled={button.disabled}
            onPress={button.handleOnPress}
            testID={button.testID}
          />
        ))}
      </ThemedScrollView>
    </View>
  )
}
