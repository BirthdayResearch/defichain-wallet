import { NavigationProp, NavigationAction } from '@react-navigation/core'
import { translate } from '@translations'
import { WalletAlert } from './WalletAlert'

type Dispatch = NavigationProp<any>['dispatch']

export function UnsavedChangesAlert (dispatch: Dispatch, action: NavigationAction): void {
  return WalletAlert({
    title: translate('components/UnsavedChangesAlert', 'You have unsaved changes'),
    message: translate('', 'Leaving this page would lose any unsaved changes. Are you sure you want to leave?'),
    buttons: [
      {
        text: translate('components/UnsavedChangesAlert', 'Go back'),
        style: 'cancel'
      },
      {
        text: translate('components/UnsavedChangesAlert', 'Leave'),
        style: 'destructive',
        onPress: async () => dispatch(action)
      }
    ]
  }

  )
}
