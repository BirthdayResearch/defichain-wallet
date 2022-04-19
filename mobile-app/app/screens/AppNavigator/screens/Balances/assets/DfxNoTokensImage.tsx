import { Image, StyleSheet } from 'react-native'
import ImageEmptyWallet from '@assets/images/address_book.png'

export function DfxNoTokensImage (): JSX.Element {
    const styles = StyleSheet.create({
        image: {
          height: 120,
          resizeMode: 'contain',
          width: 120
        }
      })

    return (
      <Image style={styles.image} source={ImageEmptyWallet} />
    )
}
