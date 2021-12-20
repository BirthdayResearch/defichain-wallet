import { NavigationProp, StackActions } from '@react-navigation/native'

/**
 * @description callback when a transaction is broadcasted
 * If page is still mounted, then it will go back to top of stack else, it will remain on the page
 * */

type Dispatch = NavigationProp<any>['dispatch']
export const onTransactionBroadcast = (isPageMounted: boolean, dispatch: Dispatch, numberOfPop?: number): void => {
  if (isPageMounted) {
    if (numberOfPop !== undefined && numberOfPop > 0) {
      dispatch(StackActions.pop(numberOfPop))
    } else {
      dispatch(StackActions.popToTop())
    }
  }
}
