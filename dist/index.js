"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mapValues = _interopRequireDefault(require("@dword-design/functions/dist/map-values"));

var _commands2 = _interopRequireDefault(require("./commands"));

var _commands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (_commands = _commands2.default, (0, _mapValues.default)('handler')(_commands));

exports.default = _default;
module.exports = exports.default;