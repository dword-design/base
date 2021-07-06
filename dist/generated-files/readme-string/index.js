"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _reduce = _interopRequireDefault(require("@dword-design/functions/dist/reduce"));

var _replace = _interopRequireDefault(require("@dword-design/functions/dist/replace"));

var _getProjectzReadmeSectionRegex = _interopRequireDefault(require("get-projectz-readme-section-regex"));

var _safeReadfile = require("safe-readfile");

var _packageConfig = _interopRequireDefault(require("../package-config"));

var _replacements2 = _interopRequireDefault(require("./replacements"));

var _replacements;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readme = (0, _safeReadfile.readFileSync)('README.md', 'utf8') || (0, _endent.default)`
  <!-- TITLE -->

  <!-- BADGES -->

  <!-- DESCRIPTION -->

  <!-- INSTALL -->

  <!-- LICENSE -->

`;

var _default = (_replacements = _replacements2.default, (0, _reduce.default)((current, getReplacement, name) => {
  var _current;

  const sectionName = name.toUpperCase();
  return _current = current, (0, _replace.default)((0, _getProjectzReadmeSectionRegex.default)(sectionName), (0, _endent.default)`
          <!-- ${sectionName}/ -->
          ${getReplacement(_packageConfig.default)}
          <!-- /${sectionName} -->
        `)(_current);
}, readme)(_replacements));

exports.default = _default;
module.exports = exports.default;