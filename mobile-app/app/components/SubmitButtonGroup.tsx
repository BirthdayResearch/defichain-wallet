
import { View } from 'react-native'
import { translate } from '@translations'
import { Button } from './Button'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { TRY_AGAIN_TIMER_COUNT, UNEXPECTED_FAILURE } from '@screens/TransactionAuthorization/api/transaction_types'
import { useNonInitialEffect } from '@hooks/useNonInitialEffect'

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
  const error = useSelector((state: RootState) => state.transactionQueue.err)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)
  const [counter, setCounter] = useState(TRY_AGAIN_TIMER_COUNT)
  const [tryAgain, setTryAgain] = useState(false)

  // avoid setting up try again button on initial load
  useNonInitialEffect(() => {
    if (error?.message === UNEXPECTED_FAILURE) {
      setTryAgain(true)
    }
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    }
  }, [error])

  const submit = (): void => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    void onSubmit()
    let count = TRY_AGAIN_TIMER_COUNT
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      count -= 1
      setCounter(count)
      if (count < 0) {
        updateTryAgainStat()
        clearInterval(id)
        setIntervalId(null)
      }
    }, 1000)
    setIntervalId(id)
  }

  const updateTryAgainStat = (): void => {
    if (error?.message === UNEXPECTED_FAILURE) {
      return setTryAgain(true)
    }
  }

  return (
    <View>
      {tryAgain
        ? (
          <Button
            label={translate('screens/common', 'TRY AGAIN')}
            onPress={() => {
              setCounter(TRY_AGAIN_TIMER_COUNT)
              submit()
              setTryAgain(false)
            }}
            testID={`button_try_again_${title}`}
            title={translate('screens/common', 'TRY AGAIN')}
            disabled={isDisabled}
          />
        )
        : (<Button
            disabled={isDisabled}
            label={label}
            onPress={submit}
            testID={`button_confirm_${title}`}
            title={title}
            isSubmitting={isProcessing}
            submittingLabel={(processingLabel != null) ? `${processingLabel} (${counter})` : undefined}
           />
        )}
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
