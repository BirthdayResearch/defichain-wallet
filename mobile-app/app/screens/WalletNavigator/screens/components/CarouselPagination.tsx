import React from 'react'
import { StyleSheet } from 'react-native'
import { Pagination, PaginationProps } from 'react-native-swiper-flatlist'

export function CarouselPagination (props: PaginationProps): JSX.Element {
  return (
    <Pagination
      {...props}
      paginationStyle={styles.paginationContainer}
    />
  )
}

const styles = StyleSheet.create({
  paginationContainer: {
    bottom: 0,
    height: 6,
    marginBottom: 75,
    marginVertical: 0,
    position: undefined
  }
})
