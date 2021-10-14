import { NavigationProp, StackActions } from '@react-navigation/native'

/**
 * @description callback when a transaction is broadcasted
 * */
export const onTransactionBroadcast = (isPageUnmounted: boolean, navigation: NavigationProp<any>): void => {
  if (isPageUnmounted) {
    navigation.dispatch(StackActions.popToTop())
  }
}
