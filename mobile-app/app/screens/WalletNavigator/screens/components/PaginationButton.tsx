import { View } from "@components";
import { ButtonV2 } from "@components/ButtonV2";
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
  const { dismissModal } = useBottomSheet();
  useEffect(() => {
    // check if user scrolls without pressing button or if animation is replayed
    if (curIndex !== paginationIndex) {
      setCurIndex(paginationIndex);
    }
  }, [paginationIndex]);

  // update button label
  useEffect(() => {
    if (curIndex > 2 && paginationIndex > 2) {
      setButtonLabel("Done");
    } else {
      setButtonLabel("Next");
    }
  }, [curIndex, paginationIndex]);

  return (
    <ThemedTouchableOpacityV2
      onPress={() => {
        if (curIndex < 4) {
          goToNextPage(curIndex + 1);
        }
        if (curIndex === PAGINATION_END) {
          dismissModal; // @chloe TODO: should close bottom sheet?
        }
      }}
      dark={tailwind("border-mono-dark-v2-900")}
      light={tailwind("border-mono-light-v2-900")}
      style={tailwind("rounded-2xl-v2 text-center py-2 px-4 border", {
        "bg-black": curIndex === PAGINATION_END && isLight,
        "bg-white": curIndex === PAGINATION_END && !isLight,
      })}
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-center text-base")}
        light={tailwind("text-mono-light-v2-900", {
          "text-mono-light-v2-100": curIndex === PAGINATION_END,
        })}
        dark={tailwind("text-mono-dark-v2-900", {
          "text-mono-dark-v2-100": curIndex === PAGINATION_END,
        })}
      >
        {translate("screens/LoansCarousel", buttonLabel)}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
};
