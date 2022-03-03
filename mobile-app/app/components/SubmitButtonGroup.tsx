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
  displayCancelBtn: boolean
  isProcessing?: boolean
  processingLabel?: string
  onSubmit: () => Promise<void>
  onCancel?: () => void
}

export function SubmitButtonGroup ({
  isDisabled,
  isCancelDisabled,
  displayCancelBtn,
  title,
  label,
  isProcessing,
  processingLabel,
  onSubmit,
  onCancel
}: SubmitButtonGroupItems): JSX.Element {
  const error = useSelector((state: RootState) => state.transactionQueue.err)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)
  const [counter, setCounter] = useState<number | null>(null)
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
    let count = TRY_AGAIN_TIMER_COUNT
    setCounter(count)
    if (intervalId !== null) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    void onSubmit()
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      count -= 1
      setCounter(count)
      if (count < 0) {
        updateTryAgainStat()
        clearInterval(id)
        setIntervalId(null)
        setCounter(null)
      }
    }, 1000)
    setIntervalId(id)
  }

  const updateTryAgainStat = (): void => {
    if (error?.message === UNEXPECTED_FAILURE) {
      return setTryAgain(true)
    }
  }

  const getSubmittingLabel = (): string | undefined => {
    if (counter === null && processingLabel !== undefined) {
      return processingLabel
    }
    if (processingLabel !== undefined) {
      return `${processingLabel} (${counter ?? '-'})`
    }
    return undefined
  }

  return (
    <View>
      {tryAgain
        ? (
          <Button
            label={translate('screens/common', 'TRY AGAIN')}
            onPress={() => {
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
            submittingLabel={getSubmittingLabel()}
           />
        )}

      {displayCancelBtn &&
        <Button
          disabled={isCancelDisabled === undefined ? isDisabled : isCancelDisabled}
          fill='flat'
          label={translate('screens/common', 'CANCEL')}
          margin='m-4 mt-0'
          onPress={onCancel}
          testID={`button_cancel_${title}`}
          title='cancel'
        />}
    </View>
  )
}
