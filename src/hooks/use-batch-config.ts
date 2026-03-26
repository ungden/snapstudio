"use client";

import { useState, useCallback, useMemo } from "react";

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

const EXAMPLE_IMAGES: Record<string, Record<ImageType, string | null>> = {
  "food-beverage": {
    display: "/examples/food-display.jpg",
    model: "/examples/food-model.jpg",
    social: "/examples/food-social.jpg",
    seeding: "/examples/food-seeding.jpg",
  },
  cosmetics: {
    display: "/examples/cosmetics-display.jpg",
    model: "/examples/cosmetics-model.jpg",
    social: "/examples/cosmetics-social.jpg",
    seeding: "/examples/cosmetics-seeding.jpg",
  },
};

const DEFAULT_EXAMPLES: Record<ImageType, string | null> = {
  display: null,
  model: null,
  social: null,
  seeding: null,
};

export function useBatchConfig(selectedIndustry?: string) {
  const [batchConfig, setBatchConfig] = useState<BatchConfig>(DEFAULT_CONFIG);

  const totalSelectedInBatch =
    batchConfig.display + batchConfig.model + batchConfig.social + batchConfig.seeding;

  const configExampleImages = useMemo<Record<ImageType, string | null>>(() => {
    if (selectedIndustry && EXAMPLE_IMAGES[selectedIndustry]) {
      return EXAMPLE_IMAGES[selectedIndustry];
    }
    return DEFAULT_EXAMPLES;
  }, [selectedIndustry]);

  const handleBatchConfigChange = useCallback(
    (type: ImageType, delta: number) => {
      setBatchConfig((prev) => {
        const newCount = prev[type] + delta;
        if (newCount < 0) return prev;
        const newConfig = { ...prev, [type]: newCount };
        const newTotal =
          newConfig.display + newConfig.model + newConfig.social + newConfig.seeding;
        if (newTotal > 12) return prev;
        return newConfig;
      });
    },
    []
  );

  const resetConfig = useCallback(() => {
    setBatchConfig(DEFAULT_CONFIG);
  }, []);

  return {
    batchConfig,
    configExampleImages,
    totalSelectedInBatch,
    handleBatchConfigChange,
    resetConfig,
  };
}
