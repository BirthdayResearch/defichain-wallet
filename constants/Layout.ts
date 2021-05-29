import { Dimensions } from 'react-native'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export const Layout = {
  window: {
    width,
    height
  },
  isSmallDevice: width < 375
}
