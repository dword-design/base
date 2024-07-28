import packageName from 'depcheck-package-name';

export default function () {
  return (
    this.config.eslintConfig || {
      extends: packageName`@dword-design/eslint-config`,
    }
  );
}
