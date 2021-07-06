"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _endent.default)`
  {
    "path": "${(0, _depcheckPackageName.default)`cz-conventional-changelog`}"
  }

`;

exports.default = _default;
module.exports = exports.default;