import { tailwind } from "@tailwind";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Pagination, PaginationProps } from "react-native-swiper-flatlist";
import { PaginationButton } from "./PaginationButton";

export function CarouselPagination(props: PaginationProps): JSX.Element {
  return <Pagination {...props} paginationStyle={styles.paginationContainer} />;
}

export function CarouselPaginationWithNextButton(
  props: PaginationProps
): JSX.Element {
  return (
    <>
      <Pagination {...props} paginationStyle={styles.paginationContainer} />
      <View style={tailwind("px-15 pb-15")}>
        <PaginationButton
          {...props}
          paginationStyle={styles.paginationContainer}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    bottom: 0,
    height: 6,
    marginBottom: 75,
    marginVertical: 0,
    position: undefined,
  },
});
