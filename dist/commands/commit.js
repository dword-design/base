"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _execa = _interopRequireDefault(require("execa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (options = {}) => (0, _execa.default)('git-cz', [...(options.allowEmpty ? ['--allow-empty'] : [])], {
  stdio: options.log === false ? 'pipe' : 'inherit'
});

exports.default = _default;
module.exports = exports.default;