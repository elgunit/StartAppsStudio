const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.blockList = [
  /\/\.local\/.*/,
  /\/\.git\/.*/,
  /\/node_modules\/.*\/node_modules\/react-native\/.*/,
];

const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
const ignoredDirs = [
  path.join(__dirname, ".local"),
  path.join(__dirname, ".git"),
  path.join(__dirname, ".cache"),
  path.join(__dirname, "attached_assets"),
];
config.watcher = config.watcher || {};
config.watcher.watchman = config.watcher.watchman || {};
config.watcher.additionalExts = config.watcher.additionalExts || [];
config.watcher.unstable_autoSaveCache = { enabled: false };
config.resolver.unstable_enablePackageExports = true;
config.watchFolders = config.watchFolders.filter(
  (folder) => !ignoredDirs.some((ig) => folder.startsWith(ig)),
);
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : [config.resolver.blockList].filter(Boolean)),
  ...ignoredDirs.map((d) => new RegExp(`^${escapeRegex(d)}/.*`)),
];

module.exports = config;
