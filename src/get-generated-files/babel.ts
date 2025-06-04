import packageName from 'depcheck-package-name';

export default {
  plugins: [
    [
      packageName`babel-plugin-module-resolver`,
      { alias: { '@/src': './dist' } },
    ],
    packageName`babel-plugin-add-import-extension`,
  ],
};
