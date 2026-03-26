"use client";

import { useState, useCallback } from "react";

export type ImageType = "display" | "model" | "social" | "seeding";

export interface BatchConfig {
  display: number;
  model: number;
  social: number;
  seeding: number;
}

const DEFAULT_CONFIG: BatchConfig = {
  display: 3,
  model: 3,
  social: 3,
  seeding: 3,
};

export function useBatchConfig() {
  const [config, setConfig] = useState<BatchConfig>(DEFAULT_CONFIG);

  const total = config.display + config.model + config.social + config.seeding;

  const updateCount = useCallback(
    (type: ImageType, count: number) => {
      const newConfig = { ...config, [type]: count };
      const newTotal =
        newConfig.display + newConfig.model + newConfig.social + newConfig.seeding;
      if (newTotal > 12) {
        throw new Error("Total number of images cannot exceed 12");
      }
      setConfig(newConfig);
    },
    [config]
  );

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    total,
    updateCount,
    resetConfig,
  };
}
