import packageNameRegex from 'package-name-regex';

const distributionPattern = /^\.\/dist\//;

export default {
  properties: {
    baseConfig: {
      properties: {
        depcheckConfig: { type: 'object' },
        name: { type: 'string' },
      },
      type: ['string', 'object'],
    },
    bin: {
      additionalProperties: {
        pattern: distributionPattern.source,
        type: 'string',
      },
      pattern: distributionPattern.source,
      type: ['object', 'string'],
    },
    dependencies: { additionalProperties: { type: 'string' }, type: 'object' },
    description: { type: 'string' },
    devDependencies: {
      additionalProperties: { type: 'string' },
      type: 'object',
    },
    keywords: { items: { type: 'string' }, type: 'array' },
    name: { pattern: packageNameRegex.source, type: 'string' },
    packageManager: { type: 'string' },
    pnpm: {
      properties: {
        overrides: { additionalProperties: { type: 'string' }, type: 'object' },
      },
      type: 'object',
    },
    version: { type: 'string' },
  },
  type: 'object',
};
