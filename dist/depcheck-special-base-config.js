"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _packageBaseConfig = _interopRequireDefault(require("./package-base-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = filePath => {
  var _filePath;

  return (_filePath = filePath, _path.default.basename(_filePath)) === 'package.json' && _packageBaseConfig.default.name !== '@dword-design/base-config-node' ? [_packageBaseConfig.default.name] : [];
};

exports.default = _default;
module.exports = exports.default;