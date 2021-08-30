import React from 'react'
import { View } from 'react-native'
import { translate } from '../translations'
import { Button } from './Button'

interface SubmitButtonGroupItems {
  isDisabled: boolean
  title: string
  label: string
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function SubmitButtonGroup ({
  isDisabled,
  title,
  label,
  onSubmit,
  onCancel
}: SubmitButtonGroupItems): JSX.Element {
  return (
    <View>
      <Button
        testID={`button_confirm_${title}`}
        disabled={isDisabled}
        label={label}
        title={title} onPress={onSubmit}
      />
      <Button
        testID={`button_cancel_${title}`}
        disabled={isDisabled}
        label={translate('screens/common', 'CANCEL')}
        title='cancel' onPress={onCancel}
        fill='flat'
        margin='m-4 mt-0'
      />
    </View>
  )
}
