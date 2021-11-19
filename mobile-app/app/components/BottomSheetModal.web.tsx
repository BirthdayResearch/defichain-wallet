import React, { ReactElement } from 'react'
import { View } from 'react-native'
import { ThemedProps } from './themed'
import Modal from 'react-overlays/Modal'
import { BottomSheetNavScreen } from './BottomSheetWithNav'
import { tailwind } from '@tailwind'

type Props = ThemedProps & {
  children: ReactElement
  screenList: BottomSheetNavScreen[]
  isModalDisplayed: boolean
  backdropComponent: () => JSX.Element
}

export const BottomSheetModal = React.forwardRef((props: Props, ref: React.Ref<any>): JSX.Element => {
  const {
    children
  } = props

  return (
    <View>
      <Modal
        container={ref as React.RefObject<any>}
        show={props.isModalDisplayed}
        renderBackdrop={() => <View style={tailwind('bg-black h-full bg-opacity-60')} />}
        style={{
        position: 'fixed',
        height: '200px',
        width: '350px',
        zIndex: 1040,
        top: '50%',
        backgroundColor: 'gray'
      }}
      >
        {children}
      </Modal>
    </View>
  )
})
