import packageNameRegex from 'package-name-regex'

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
      additionalProperties: { pattern: /^\.\/dist\//.source, type: 'string' },
      type: 'object',
    },
    dependencies: {
      additionalProperties: { type: 'string' },
      type: 'object',
    },
    description: { type: 'string' },
    devDependencies: {
      additionalProperties: { type: 'string' },
      type: 'object',
    },
    keywords: {
      items: { type: 'string' },
      type: 'array',
    },
    name: {
      pattern: packageNameRegex.source,
      type: 'string',
    },
    version: { type: 'string' },
  },
  type: 'object',
}
