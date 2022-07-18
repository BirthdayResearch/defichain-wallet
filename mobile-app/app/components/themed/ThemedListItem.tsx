import { ViewProps } from 'react-native'
import { ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'

type IListProps = React.PropsWithChildren<ViewProps> & ListProps

interface ListProps {
    onPress: () => void
    isLast: boolean
    disabled?: boolean
    testId?: string
}

export function ThemedListItem (props: IListProps): JSX.Element {
    const {
       onPress,
       isLast,
       disabled,
       testId,
       children,
       ...otherProps
    } = props
    return (
      <ThemedViewV2
        style={tailwind({ 'border-b-0.5': !isLast })}
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-dark-v2-300')}
        {...otherProps}
      >
        <ThemedTouchableOpacityV2
          onPress={onPress}
          style={tailwind('flex flex-row items-center justify-between py-4 border-0')}
          testID={testId}
          disabled={disabled}
        >
          {children}
        </ThemedTouchableOpacityV2>
      </ThemedViewV2>
    )
}
