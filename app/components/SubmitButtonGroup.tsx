import React from 'react'
import { View } from 'react-native'
import { translate } from '../translations'
import { Button } from './Button'

interface SubmitButtonGroupItems {
  isDisabled: boolean
  title: string
  label: string | JSX.Element
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
        disabled={isDisabled}
        label={label}
        onPress={onSubmit}
        testID={`button_confirm_${title}`}
        title={title}
      />

      <Button
        disabled={isDisabled}
        fill='flat'
        label={translate('screens/common', 'CANCEL')}
        margin='m-4 mt-0'
        onPress={onCancel}
        testID={`button_cancel_${title}`}
        title='cancel'
      />
    </View>
  )
}
