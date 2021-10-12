import { NavigationProp, StackActions } from '@react-navigation/native'

export const onBroadcast = (isOnPage: boolean, navigation: NavigationProp<any>): void => {
  if (isOnPage) {
    navigation.dispatch(StackActions.popToTop())
  }
}
