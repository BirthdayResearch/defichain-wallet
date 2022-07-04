import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { Pagination, PaginationProps } from 'react-native-swiper-flatlist'

export function CarouselPagination (props: PaginationProps): JSX.Element {
  return (
    <Pagination
      {...props}
      paginationStyle={Platform.OS === 'web' ? styles.paginationContainerWeb : styles.paginationContainer}
    />
  )
}

const styles = StyleSheet.create({
  paginationContainer: {
    bottom: 66
  },
  paginationContainerWeb: {
    bottom: 0
  }
})
