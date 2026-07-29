// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Vendored gluestack-ui components are generated code (marked // @ts-nocheck);
    // Metro transpiles them but we don't hold them to lint rules.
    ignores: ["dist/*", "src/components/gs/**"],
  },
  {
    rules: {
      // The React Compiler rules (shipped in eslint-plugin-react-hooks v7) don't
      // model Reanimated shared values (`sv.value = withSpring(...)`) or RN
      // Animated.Value refs read during render - both idiomatic here - and flag
      // that valid code as errors. Turn them off; classic hook rules stay on.
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
]);
