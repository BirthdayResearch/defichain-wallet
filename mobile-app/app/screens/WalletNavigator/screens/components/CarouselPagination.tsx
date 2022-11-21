import { useStyles } from "@tailwind";
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
  const { tailwind } = useStyles();
  return (
    <View
      style={tailwind({
        "-mt-5 mb-10": Platform.OS === "ios",
        "-mt-8": Platform.OS === "android",
      })}
    >
      <Pagination {...props} paginationStyle={styles.paginationContainer} />
      <View style={tailwind("px-15")}>
        <PaginationButton
          {...props}
          paginationStyle={styles.paginationContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    bottom: 0,
    height: 6,
    marginBottom: 64,
    marginVertical: 0,
    position: undefined,
  },
});
