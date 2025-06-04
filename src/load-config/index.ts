import { cosmiconfig } from 'cosmiconfig';

export default async ({ cwd = '.' } = {}) => {
  const explorer = cosmiconfig('base', { packageProp: 'baseConfig' });
  const result = await explorer.search(cwd);
  let config = result?.config ?? null;

  if (typeof config === 'string') {
    config = { name: config };
  }

  return config;
};
