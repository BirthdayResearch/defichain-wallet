import { ThemedProps, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { StyleProp, TextStyle, TouchableOpacityProps, View } from 'react-native'

interface ButtonGroupProps {
  buttons: Buttons[]
  activeButtonGroupItem: string
  testID: string
  labelStyle?: StyleProp<TextStyle>
  containerThemedProps?: ThemedProps
  modalStyle?: StyleProp<TextStyle>
  lightThemeStyle?: { [key: string]: string }
  darkThemeStyle?: { [key: string]: string }
  customButtonGroupStyle?: StyleProp<TouchableOpacityProps>
  customActiveStyle?: ThemedProps
  inverted?: boolean
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
      light={props.lightThemeStyle ?? tailwind('bg-gray-100')}
      dark={props.darkThemeStyle ?? tailwind('bg-dfxblue-800')}
      style={tailwind('rounded-2xl flex flex-row justify-between')}
      testID={props.testID}
      {...props.containerThemedProps}
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
            labelStyle={props.labelStyle}
            modalStyle={props.modalStyle}
            customButtonGroupStyle={props.customButtonGroupStyle}
            customActiveStyle={props.customActiveStyle}
            inverted={props.inverted}
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
  labelStyle?: StyleProp<TextStyle>
  modalStyle?: StyleProp<TextStyle>
  customButtonGroupStyle?: StyleProp<TouchableOpacityProps>
  customActiveStyle?: ThemedProps
  inverted?: boolean
}

function ButtonGroupItem (props: ButtonGroupItemProps): JSX.Element {
  return (
    <View style={tailwind('flex-shrink')}>
      <ThemedTouchableOpacity
        onPress={props.onPress}
        light={tailwind({ 'bg-primary-50': props.isActive })}
        dark={(props.inverted === true) ? tailwind({ 'bg-dfxblue-800': props.isActive }) : tailwind({ 'bg-dfxblue-900': props.isActive })}
        {...props.isActive && props.customActiveStyle}
        style={props.customButtonGroupStyle ?? [[tailwind('m-0.5 py-2 px-3'), { borderRadius: 14 }]]}
        // TODO: (thabrad) check, from LW (somehow isn't working, maybe bc of below Text style) --> style={props.customButtonGroupStyle ?? [tailwind(['rounded-2xl break-words justify-center py-2 px-3']), { width: `${props.width.toFixed(2)}%` }]}
        testID={`${props.testID}${props.isActive ? '_active' : ''}`}
      >
        <ThemedText
          light={tailwind({ 'text-primary-500': props.isActive, 'text-gray-900': !props.isActive })}
          dark={tailwind({ 'text-white': props.isActive, 'text-dfxgray-300': !props.isActive })}
          style={props.modalStyle ?? tailwind('font-medium text-sm text-center')}
        >
          {props.label}
        </ThemedText>
      </ThemedTouchableOpacity>
    </View>
  )
}
