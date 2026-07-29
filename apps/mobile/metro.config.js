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
// Resolve @locklune/core directly from its TypeScript source, so bundling never
// depends on a prior `dist/` build (its package.json points main/exports at
// dist/, which is gitignored and absent on EAS). Metro transpiles the source via
// Babel since packages/core is inside watchFolders. A resolveRequest override is
// required here: extraNodeModules is only a fallback for otherwise-unresolvable
// modules, and the workspace symlink resolves first (then fails on the missing dist).
const coreSrc = path.resolve(monorepoRoot, 'packages/core/src');
const coreSrcEntry = path.join(coreSrc, 'index.ts');
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@locklune/core') {
    return { type: 'sourceFile', filePath: coreSrcEntry };
  }
  // core is authored as NodeNext ESM with explicit `.js` specifiers (for its dist
  // build); when bundling its .ts source directly, rewrite ./foo.js -> ./foo.ts.
  if (
    moduleName.startsWith('.') &&
    moduleName.endsWith('.js') &&
    context.originModulePath.startsWith(coreSrc)
  ) {
    const tsPath = path.resolve(
      path.dirname(context.originModulePath),
      moduleName.slice(0, -'.js'.length) + '.ts',
    );
    return { type: 'sourceFile', filePath: tsPath };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/global.css' });
