"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _rawConfig = _interopRequireDefault(require("./raw-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = filePath => {
  var _filePath;

  return (_filePath = filePath, _path.default.basename(_filePath)) === 'package.json' && _rawConfig.default.name !== '@dword-design/base-config-node' ? [_rawConfig.default.name] : [];
};

exports.default = _default;
module.exports = exports.default;