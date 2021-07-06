"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _config.default.eslintConfig || {
  extends: (0, _depcheckPackageName.default)`@dword-design/eslint-config`
};

exports.default = _default;
module.exports = exports.default;