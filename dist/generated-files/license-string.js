"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _spdxExpressionParse = _interopRequireDefault(require("spdx-expression-parse"));

var _full = _interopRequireDefault(require("spdx-license-list/full"));

var _packageConfig = _interopRequireDefault(require("./package-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parsed = (0, _spdxExpressionParse.default)(_packageConfig.default.license);
const license = _full.default[parsed.license];

var _default = (0, _endent.default)`
  # License

  Unless stated otherwise all works are:

  Copyright &copy; ${_packageConfig.default.author}

  and licensed under:

  [${license.name}](${license.url})

  ## ${license.name}

  ${license.licenseText}
`;

exports.default = _default;
module.exports = exports.default;