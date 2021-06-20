"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _endent.default)`
  * text=auto eol=lf
  *.glb filter=lfs diff=lfs merge=lfs -text
  *.jpg filter=lfs diff=lfs merge=lfs -text
  *.png filter=lfs diff=lfs merge=lfs -text

`;

exports.default = _default;
module.exports = exports.default;