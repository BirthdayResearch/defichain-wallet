import { NavigationProp, StackActions } from '@react-navigation/native'

/**
 * @description callback when a transaction is broadcasted
 * */
export const onTransactionBroadcast = (resetToFirstScreen: boolean, navigation: NavigationProp<any>): void => {
  if (resetToFirstScreen) {
    navigation.dispatch(StackActions.popToTop())
  }
}
