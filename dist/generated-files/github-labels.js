"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _flatten = _interopRequireDefault(require("@dword-design/functions/dist/flatten"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _mapValues = _interopRequireDefault(require("@dword-design/functions/dist/map-values"));

var _sortBy = _interopRequireDefault(require("@dword-design/functions/dist/sort-by"));

var _values = _interopRequireDefault(require("@dword-design/functions/dist/values"));

var _ref, _ref2, _ref3, _BFD4F2$C2E0C6$EDEDED;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (_ref = (_ref2 = (_ref3 = (_BFD4F2$C2E0C6$EDEDED = {
  BFD4F2: ['blocking', 'breaking', 'important'],
  C2E0C6: ['active', 'blocked', 'maintenance', 'waiting-for'],
  EDEDED: ['released', 'semantic-release']
}, (0, _mapValues.default)((names, color) => {
  var _names;

  return _names = names, (0, _map.default)(name => ({
    color,
    name
  }))(_names);
})(_BFD4F2$C2E0C6$EDEDED)), (0, _values.default)(_ref3)), (0, _flatten.default)(_ref2)), (0, _sortBy.default)('name')(_ref));

exports.default = _default;
module.exports = exports.default;