import { ThemedTextV2, ThemedTouchableOpacityV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import React, { useCallback, useEffect, useState } from "react";
import { PaginationProps } from "react-native-swiper-flatlist";

// eslint-disable-next-line react/function-component-definition
export const PaginationButton: React.FC<PaginationProps> = ({
  paginationIndex = 0,
  scrollToIndex,
}) => {
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
        goToNextPage(curIndex + 1);
      }}
      dark={tailwind("border-mono-dark-v2-900")}
      light={tailwind("border-mono-light-v2-900")}
      style={tailwind("rounded-2xl-v2 text-center py-2 px-4 border")}
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-center text-base")}
        light={tailwind("text-mono-light-v2-900")}
        dark={tailwind("text-mono-dark-v2-900")}
      >
        {translate("screens/LoansCarousel", buttonLabel)}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
};
