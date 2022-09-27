import { ThemedTextV2, ThemedTouchableOpacityV2 } from "@components/themed";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import React, { useCallback, useEffect, useState } from "react";
import { PaginationProps } from "react-native-swiper-flatlist";

const PAGINATION_END = 3;

interface PaginationButtonProps extends PaginationProps {
  dismissModal: () => void;
}
export function PaginationButton({
  paginationIndex = 0,
  scrollToIndex,
  dismissModal,
}: PaginationButtonProps): JSX.Element {
  const { isLight } = useThemeContext();

  const [curIndex, setCurIndex] = useState(paginationIndex);
  const [buttonLabel, setButtonLabel] = useState("Next");

  const goToNextPage = useCallback(
    (curPage: number) => {
      if (curPage < PAGINATION_END + 1) {
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

  useEffect(() => {
    if (curIndex < PAGINATION_END) {
      setButtonLabel("Next");
    } else {
      setButtonLabel("Done");
    }
  }, [curIndex]);

  return (
    <ThemedTouchableOpacityV2
      onPress={() => {
        if (endOfPagination) {
          return dismissModal();
        } else {
          return goToNextPage(curIndex + 1);
        }
      }}
      dark={tailwind("border-mono-dark-v2-900")}
      light={tailwind("border-mono-light-v2-900")}
      style={tailwind("rounded-full text-center py-3.5 px-4 border", {
        "bg-black": endOfPagination && isLight,
        "bg-white": endOfPagination && !isLight,
      })}
    >
      <ThemedTextV2
        style={tailwind("font-semibold-v2 text-center text-base")}
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
}
