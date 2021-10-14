import { NavigationProp, StackActions } from '@react-navigation/native'

/**
 * @description callback when a transaction is broadcasted
 * If page is still mounted, then it will go back to top of stack else, it will remain on the page
 * */

type Dispatch = NavigationProp<any>['dispatch']
export const onTransactionBroadcast = (isPageMounted: boolean, dispatch: Dispatch): void => {
  if (isPageMounted) {
    dispatch(StackActions.popToTop())
  }
}
