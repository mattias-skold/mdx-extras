import { defineConfig, mergeConfig } from "vite";
import { baseConfig } from "@mdexitor/tooling/vite.config.base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: {
        entry: "./src/index.ts",
        name: "SourcePreviewPlugin",
        fileName: "index",
      },
    },
  }),
);
