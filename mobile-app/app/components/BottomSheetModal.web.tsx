import React, { ReactElement, useCallback, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { ThemedProps } from './themed'
import Modal from 'react-overlays/Modal'

type Props = ThemedProps & {
  triggerComponent: ReactElement
  children: ReactElement
  alertInfo?: { title: string, message: string }
}

export const BottomSheetModal = (props: Props): JSX.Element => {
  const {
    children,
    triggerComponent
  } = props
  const [showModal, setShowModal] = useState(false)

  const triggerModal = useCallback(() => {
    setShowModal(!showModal)
  }, [showModal])

  return (
    <View>
      <TouchableOpacity onPress={triggerModal}>
        {triggerComponent}
      </TouchableOpacity>
      <Modal
        show={showModal} style={{
        position: 'fixed',
        width: '400px',
        zIndex: 1040,
        right: '50%',
        top: '50%',
        backgroundColor: 'gray'
      }}
      >
        {children}
      </Modal>
    </View>
  )
}
