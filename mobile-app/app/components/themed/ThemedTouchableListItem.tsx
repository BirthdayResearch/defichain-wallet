import { ViewProps } from 'react-native'
import { ThemedViewV2 } from './ThemedViewV2'
import { ThemedTouchableOpacityV2 } from './ThemedTouchableOpacityV2'
import { tailwind } from '@tailwind'

type IListProps = React.PropsWithChildren<ViewProps> & ListProps

interface ListProps {
    onPress: () => void
    isLast: boolean
    disabled?: boolean
    testId?: string
    styleProps?: string
}

export function ThemedTouchableListItem (props: IListProps): JSX.Element {
    const {
       onPress,
       isLast,
       disabled,
       testId,
       styleProps = 'py-4.5',
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
          style={tailwind(`flex flex-row items-center justify-between border-0 ${styleProps}`)}
          testID={testId}
          disabled={disabled}
        >
          {children}
        </ThemedTouchableOpacityV2>
      </ThemedViewV2>
    )
}
