import { cosmiconfigSync } from 'cosmiconfig';

export default ({ cwd = '.' } = {}) => {
  const explorer = cosmiconfigSync('base', { packageProp: 'baseConfig' });
  let config = explorer.search(cwd)?.config ?? null;

  if (typeof config === 'string') {
    config = { name: config };
  }

  return config;
};
