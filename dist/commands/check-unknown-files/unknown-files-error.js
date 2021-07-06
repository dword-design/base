"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _identity = _interopRequireDefault(require("@dword-design/functions/dist/identity"));

var _join = _interopRequireDefault(require("@dword-design/functions/dist/join"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _sortBy = _interopRequireDefault(require("@dword-design/functions/dist/sort-by"));

var _package = _interopRequireDefault(require("../../../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class _default extends Error {
  constructor(files) {
    var _ref, _ref2, _ref3, _files;

    super((0, _endent.default)`
      There are files in this repository that are not known to ${_package.default.name}. Let's discuss about them in a PR!
      
      ${(_ref = (_ref2 = (_ref3 = (_files = files, (0, _keys.default)(_files)), (0, _map.default)(file => `* ${file}`)(_ref3)), (0, _sortBy.default)(_identity.default)(_ref2)), (0, _join.default)('\n')(_ref))}
    `);
  }

}

exports.default = _default;
module.exports = exports.default;