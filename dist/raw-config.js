"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cosmiconfig = require("cosmiconfig");

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

var _pluginNameToPackageName = require("plugin-name-to-package-name");

var _explorer$search;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const explorer = (0, _cosmiconfig.cosmiconfigSync)('base', {
  packageProp: 'baseConfig'
});
let config = ((_explorer$search = explorer.search()) === null || _explorer$search === void 0 ? void 0 : _explorer$search.config) || {};

if (typeof config === 'string') {
  config = {
    name: config
  };
}

var _default = { ...config,
  name: config.name ? (0, _pluginNameToPackageName.transform)(config.name, 'base-config') : (0, _depcheckPackageName.default)`@dword-design/base-config-node`
};
exports.default = _default;
module.exports = exports.default;