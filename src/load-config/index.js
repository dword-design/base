import { cosmiconfig } from 'cosmiconfig';

export default async () => {
  const explorer = cosmiconfig('base', { packageProp: 'baseConfig' });
  const result = await explorer.search();
  const config = result?.config ?? null;

  if (typeof config === 'string') {
    config = { name: config };
  }

  return config;
};
