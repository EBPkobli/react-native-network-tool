const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo packages so Metro can resolve file: dependencies
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages/sdk'),
  path.resolve(monorepoRoot, 'packages/shared'),
];

// Make sure Metro can resolve modules from both the project and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
