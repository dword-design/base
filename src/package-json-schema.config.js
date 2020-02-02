import packageNameRegex from 'package-name-regex'
import stableVersionRegex from 'stable-version-regex'

export default {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      pattern: packageNameRegex.source,
    },
    version: {
      type: 'string',
      pattern: stableVersionRegex.source,
    },
    baseConfig: {
      type: ['string', 'object'],
      properties: {
        name: { type: 'string' },
        depcheckConfig: { type: 'object' },
      },
    },
    description: { type: 'string' },
    keywords: {
      type: 'array',
      items: { type: 'string' },
    },
    bin: {
      type: 'object',
      additionalProperties: { type: 'string', pattern: /^\.\/dist\//.source },
    },
    dependencies: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
    devDependencies: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
  },
}
