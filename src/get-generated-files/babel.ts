import packageName from 'depcheck-package-name';

export default {
  plugins: [
    [
      packageName`babel-plugin-module-resolver`,
      { alias: { '@/src': './dist' } },
    ],
    packageName`add-import-extension`,
  ],
};
