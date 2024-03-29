// used when packaging the library for distribution
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      // eslint-disable-next-line no-undef
      entry: resolve(__dirname, "src/main.ts"),
      name: "ptr",
      // the proper extensions will be added
      fileName: "ptr",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
