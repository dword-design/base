"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _packageNameRegex = _interopRequireDefault(require("package-name-regex"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  properties: {
    baseConfig: {
      properties: {
        depcheckConfig: {
          type: 'object'
        },
        name: {
          type: 'string'
        }
      },
      type: ['string', 'object']
    },
    bin: {
      additionalProperties: {
        pattern: /^\.\/dist\//.source,
        type: 'string'
      },
      type: 'object'
    },
    dependencies: {
      additionalProperties: {
        type: 'string'
      },
      type: 'object'
    },
    description: {
      type: 'string'
    },
    devDependencies: {
      additionalProperties: {
        type: 'string'
      },
      type: 'object'
    },
    keywords: {
      items: {
        type: 'string'
      },
      type: 'array'
    },
    name: {
      pattern: _packageNameRegex.default.source,
      type: 'string'
    },
    version: {
      type: 'string'
    }
  },
  type: 'object'
};
exports.default = _default;
module.exports = exports.default;