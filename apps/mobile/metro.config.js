// Metro config: NativeWind + monorepo (workspace packages like @locklune/core).
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so changes in packages/* are picked up.
config.watchFolders = [monorepoRoot];
// Resolve modules from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
// Resolve @locklune/core directly from TypeScript source — no dist/ build needed.
config.resolver.extraNodeModules = {
  '@locklune/core': path.resolve(monorepoRoot, 'packages/core/src'),
};

module.exports = withNativeWind(config, { input: './src/global.css' });
