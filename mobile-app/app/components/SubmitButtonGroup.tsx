
import { View } from 'react-native'
import { translate } from '@translations'
import { Button } from './Button'

interface SubmitButtonGroupItems {
  isDisabled: boolean
  isCancelDisabled?: boolean
  title: string
  label: string
  isProcessing?: boolean
  processingLabel?: string
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function SubmitButtonGroup ({
  isDisabled,
  isCancelDisabled,
  title,
  label,
  isProcessing,
  processingLabel,
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
        isSubmitting={isProcessing}
        submittingLabel={processingLabel}
      />

      <Button
        disabled={isCancelDisabled === undefined ? isDisabled : isCancelDisabled}
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
