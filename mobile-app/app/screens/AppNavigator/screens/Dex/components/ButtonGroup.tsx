import { ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'

interface ButtonGroupProps {
  buttons: Buttons[]
  activeButtonGroupItem: string
}

interface Buttons {
  id: string
  label: string
  handleOnPress: () => void
}

export function ButtonGroup (props: ButtonGroupProps): JSX.Element {
  const buttonWidth = new BigNumber(100).dividedBy(props.buttons.length)
  return (
    <ThemedView
      light={tailwind('bg-gray-100')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('rounded-2xl flex flex-row')}
    >
      {
        props.buttons.map((button) => (
          <ButtonGroupItem
            label={button.label}
            onPress={button.handleOnPress}
            isActive={props.activeButtonGroupItem === button.id}
            width={buttonWidth}
            key={button.id}
          />
        ))
      }
    </ThemedView>
  )
}

interface ButtonGroupItemProps {
  label: string
  onPress: () => void
  isActive: boolean
  width: BigNumber
}

function ButtonGroupItem (props: ButtonGroupItemProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={props.onPress}
      light={tailwind({ 'bg-primary-50': props.isActive })}
      dark={tailwind({ 'bg-darkprimary-50': props.isActive })}
      style={[tailwind('rounded-2xl text-center py-2 px-3'), { width: `${props.width.toFixed(2)}%` }]}
    >
      <ThemedText
        light={tailwind({ 'text-primary-500': props.isActive, 'text-gray-900': !props.isActive })}
        dark={tailwind({ 'text-darkprimary-500': props.isActive, 'text-gray-50': !props.isActive })}
        style={tailwind('font-medium')}
      >
        {props.label}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}
