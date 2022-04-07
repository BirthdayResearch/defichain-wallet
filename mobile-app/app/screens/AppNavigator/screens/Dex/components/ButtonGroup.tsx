import { ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { StyleProp, TextStyle } from 'react-native'

interface ButtonGroupProps {
  buttons: Buttons[]
  activeButtonGroupItem: string
  testID: string
  modalStyle?: StyleProp<TextStyle>
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
      dark={tailwind('bg-dfxblue-800')}
      style={tailwind('rounded-xl flex flex-row justify-between')}
      testID={props.testID}
    >
      {
        props.buttons.map((button) => (
          <ButtonGroupItem
            label={button.label}
            onPress={button.handleOnPress}
            isActive={props.activeButtonGroupItem === button.id}
            width={buttonWidth}
            key={button.id}
            testID={`${props.testID}_${button.id}`}
            modalStyle={props.modalStyle}
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
  testID: string
  modalStyle?: StyleProp<TextStyle>
}

function ButtonGroupItem (props: ButtonGroupItemProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={props.onPress}
      light={tailwind({ 'bg-primary-50': props.isActive })}
      dark={tailwind({ 'bg-dfxblue-900': props.isActive })}
      style={tailwind('rounded-xl m-1 py-2 px-3 break-words justify-center')} // Style Breaking: , { width: `${props.width.toFixed(2)}%` }
      testID={`${props.testID}${props.isActive ? '_active' : ''}`}
    >
      <ThemedText
        light={tailwind({ 'text-primary-500': props.isActive, 'text-gray-900': !props.isActive })}
        dark={tailwind({ 'text-gray-300': props.isActive, 'text-dfxgray-300': !props.isActive })}
        style={props.modalStyle ?? tailwind('font-medium text-sm text-center')}
      >

        {props.label}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}
