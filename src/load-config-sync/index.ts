import { cosmiconfigSync } from 'cosmiconfig';

export default () => {
  const explorer = cosmiconfigSync('base', { packageProp: 'baseConfig' });
  let config = explorer.search()?.config ?? null;

  if (typeof config === 'string') {
    config = { name: config };
  }

  return config;
};
