import { ReactElement } from 'react'
import * as React from 'react'
import { View } from 'react-native'
import { ThemedProps } from './themed'
import Modal from 'react-overlays/Modal'
import { BottomSheetNavScreen } from './BottomSheetWithNav'

type Props = ThemedProps & {
  children: ReactElement
  screenList: BottomSheetNavScreen[]
  isModalDisplayed: boolean
  modalStyle?: {
    [other: string]: any
  }
}

export const BottomSheetModal = React.forwardRef((props: Props, ref: React.Ref<any>): JSX.Element => {
  const {
    children
  } = props

  const style = props.modalStyle !== undefined
      ? props.modalStyle
    : {
      position: 'absolute',
      bottom: '0',
      height: '505px',
      width: '375px',
      zIndex: 50
      }

  return (
    <Modal
      container={ref as React.RefObject<any>}
      show={props.isModalDisplayed}
      renderBackdrop={() => (
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'black',
          opacity: 0.3
        }}
        />
      )}
      style={style} // array as value crashes Web Modal
    >
      {children}
    </Modal>
  )
})
