import { useCallback, useRef, useState } from "react";
import * as React from "react";
import { Platform } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetNavScreen } from "@components/BottomSheetWithNav";

interface SnapPoints {
  ios: string[];
  android: string[];
}

export const useBottomSheet = (): {
  isModalDisplayed: boolean;
  setIsModalDisplayed: (val: boolean) => void;
  containerRef: React.Ref<any>;
  bottomSheetRef: React.Ref<BottomSheetModal>;
  dismissModal: () => void;
  expandModal: () => void;
  bottomSheetScreen: BottomSheetNavScreen[];
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void;
  snapPoints: SnapPoints;
  setSnapPoints: (val: SnapPoints) => void;
} => {
  const [isModalDisplayed, setIsModalDisplayed] = useState(false);
  const containerRef = useRef(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
  const [snapPoints, setSnapPoints] = useState<SnapPoints>({
    ios: ["50%"],
    android: ["60%"],
  });

  const expandModal = useCallback(() => {
    if (Platform.OS === "web") {
      setIsModalDisplayed(true);
    } else {
      bottomSheetRef.current?.present();
    }
  }, []);
  const dismissModal = useCallback(() => {
    if (Platform.OS === "web") {
      setIsModalDisplayed(false);
    } else {
      bottomSheetRef.current?.close();
    }
  }, []);

  return {
    isModalDisplayed,
    setIsModalDisplayed,
    containerRef,
    bottomSheetRef,
    dismissModal,
    expandModal,
    bottomSheetScreen,
    setBottomSheetScreen,
    snapPoints,
    setSnapPoints,
  };
};
