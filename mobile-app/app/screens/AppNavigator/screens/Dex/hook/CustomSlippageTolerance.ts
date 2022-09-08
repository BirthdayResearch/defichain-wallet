import { CustomSlippageTolerancePersistence } from "@api/persistence/custom_slippage-tolerance_storage";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useEffect, useState } from "react";

interface CustomSlippageTolerance {
  isCustomSlippageTolerance: string;
  setIsCustomSlippageTolerance: (val: string) => Promise<void>;
}

export function useCustomSlippageTolerance(): CustomSlippageTolerance {
  const logger = useLogger();
  const [isCustomSlippageTolerance, setIsCustomSlippageTolerance] =
    useState("false");

  useEffect(() => {
    CustomSlippageTolerancePersistence.get()
      .then((isCustom: string) => {
        setIsCustomSlippageTolerance(isCustom);
      })
      .catch(logger.error);
  }, []);

  const updateIsCustom = async (isCustomVal: string): Promise<void> => {
    setIsCustomSlippageTolerance(isCustomVal);
    await CustomSlippageTolerancePersistence.set(isCustomVal);
  };

  return {
    isCustomSlippageTolerance,
    setIsCustomSlippageTolerance: updateIsCustom,
  };
}
