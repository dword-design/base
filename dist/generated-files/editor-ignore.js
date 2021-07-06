"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _identity = _interopRequireDefault(require("@dword-design/functions/dist/identity"));

var _sortBy = _interopRequireDefault(require("@dword-design/functions/dist/sort-by"));

var _config = _interopRequireDefault(require("../config"));

var _commonEditorIgnore = _interopRequireDefault(require("./common-editor-ignore.json"));

var _ref;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (_ref = [..._commonEditorIgnore.default, ..._config.default.editorIgnore], (0, _sortBy.default)(_identity.default)(_ref));

exports.default = _default;
module.exports = exports.default;