"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fromPairs = _interopRequireDefault(require("@dword-design/functions/dist/from-pairs"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _editorIgnore = _interopRequireDefault(require("./editor-ignore"));

var _ref, _editorIgnoreConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  'editor.tabSize': 2,
  'files.exclude': (_ref = (_editorIgnoreConfig = _editorIgnore.default, (0, _map.default)(config => [config, true])(_editorIgnoreConfig)), (0, _fromPairs.default)(_ref)),
  'workbench.editor.enablePreview': false
};
exports.default = _default;
module.exports = exports.default;