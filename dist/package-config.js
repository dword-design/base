"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _loadPkg = _interopRequireDefault(require("load-pkg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _loadPkg.default.sync() || {};

exports.default = _default;
module.exports = exports.default;