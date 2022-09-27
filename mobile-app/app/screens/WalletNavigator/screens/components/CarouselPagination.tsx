import { tailwind } from "@tailwind";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Pagination, PaginationProps } from "react-native-swiper-flatlist";
import { PaginationButton } from "./PaginationButton";

export function CarouselPagination(props: PaginationProps): JSX.Element {
  return <Pagination {...props} paginationStyle={styles.paginationContainer} />;
}

interface CarouselPaginationWithNextButtonProps extends PaginationProps {
  dismissModal: () => void;
}

export function CarouselPaginationWithNextButton(
  props: CarouselPaginationWithNextButtonProps
): JSX.Element {
  return (
    <>
      <Pagination {...props} paginationStyle={styles.paginationContainer} />
      <View style={tailwind("px-15", { "pb-20": Platform.OS !== "web" })}>
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
