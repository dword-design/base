"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

var _pluginNameToPackageName = require("plugin-name-to-package-name");

var _packageConfig = _interopRequireDefault(require("./package-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const packageBaseConfig = typeof _packageConfig.default.baseConfig === 'string' ? {
  name: _packageConfig.default.baseConfig
} : _packageConfig.default.baseConfig || {};
var _default = {
  syncKeywords: true,
  ...packageBaseConfig,
  name: packageBaseConfig.name ? (0, _pluginNameToPackageName.transform)(packageBaseConfig.name, 'base-config') : (0, _depcheckPackageName.default)`@dword-design/base-config-node`
};
exports.default = _default;
module.exports = exports.default;