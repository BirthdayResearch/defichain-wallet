import { Image, StyleSheet } from 'react-native'
import ImageEmptyWallet from '@assets/images/address_book.png'

export function DfxNoTokensImage (): JSX.Element {
    const styles = StyleSheet.create({
        image: {
          height: 100,
          resizeMode: 'contain',
          width: 100
        }
      })

    return (
      <Image style={styles.image} source={ImageEmptyWallet} />
    )
}
