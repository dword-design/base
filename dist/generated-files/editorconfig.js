"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _endent.default)`
  # Editor configuration, see http://editorconfig.org
  root = true

  [*]
  charset = utf-8
  indent_style = space
  indent_size = 2
  insert_final_newline = true
  trim_trailing_whitespace = true

  [*.md]
  max_line_length = off
  trim_trailing_whitespace = false
`;

exports.default = _default;
module.exports = exports.default;