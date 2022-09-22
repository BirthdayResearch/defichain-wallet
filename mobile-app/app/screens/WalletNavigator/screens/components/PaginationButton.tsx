import { ThemedTextV2, ThemedTouchableOpacityV2 } from "@components/themed";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import React, { useCallback, useEffect, useState } from "react";
import { PaginationProps } from "react-native-swiper-flatlist";

const PAGINATION_END = 3;

// eslint-disable-next-line react/function-component-definition
export const PaginationButton: React.FC<PaginationProps> = ({
  paginationIndex = 0,
  scrollToIndex,
}) => {
  const { isLight } = useThemeContext();
  const { dismissModal } = useBottomSheet();

  const [curIndex, setCurIndex] = useState(paginationIndex);
  const [buttonLabel, setButtonLabel] = useState("Next");

  const goToNextPage = useCallback(
    (curPage: number) => {
      if (curPage < 4) {
        setCurIndex(curPage);
        scrollToIndex({ index: curPage });
      }
    },
    [scrollToIndex]
  );
  const endOfPagination = curIndex === PAGINATION_END;

  useEffect(() => {
    // check if user scrolls without pressing button or if animation is replayed
    if (curIndex !== paginationIndex) {
      setCurIndex(paginationIndex);
    }
  }, [paginationIndex]);

  // update button label
  useEffect(() => {
    if (curIndex < PAGINATION_END && paginationIndex < PAGINATION_END) {
      setButtonLabel("Next");
    } else {
      setButtonLabel("Done");
    }
  }, [curIndex, paginationIndex]);

  return (
    <ThemedTouchableOpacityV2
      onPress={() => {
        if (curIndex <= PAGINATION_END) {
          goToNextPage(curIndex + 1);
        }
        if (endOfPagination) {
          dismissModal(); // @chloe TODO: should close bottom sheet?
        }
      }}
      dark={tailwind("border-mono-dark-v2-900")}
      light={tailwind("border-mono-light-v2-900")}
      style={tailwind("rounded-2xl-v2 text-center py-2 px-4 border", {
        "bg-black": endOfPagination && isLight,
        "bg-white": endOfPagination && !isLight,
      })}
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-center text-base")}
        light={tailwind("text-mono-light-v2-900", {
          "text-mono-light-v2-100": endOfPagination,
        })}
        dark={tailwind("text-mono-dark-v2-900", {
          "text-mono-dark-v2-100": endOfPagination,
        })}
      >
        {translate("screens/LoansCarousel", buttonLabel)}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
};
