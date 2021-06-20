"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _join = _interopRequireDefault(require("@dword-design/functions/dist/join"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _omit = _interopRequireDefault(require("@dword-design/functions/dist/omit"));

var _depcheck = _interopRequireDefault(require("depcheck"));

var _config = _interopRequireDefault(require("../../config"));

var _packageConfig3 = _interopRequireDefault(require("../../package-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const processResult = (caption, deps) => {
  if (deps.length > 0) {
    var _ref, _deps;

    throw new Error((_ref = [caption, ...(_deps = deps, (0, _map.default)(dep => `* ${dep}`)(_deps))], (0, _join.default)('\n')(_ref)));
  }
};

var _default = async () => {
  var _packageConfig, _packageConfig2;

  let result = await (0, _depcheck.default)('.', {
    package: (_packageConfig = _packageConfig3.default, (0, _omit.default)(['devDependencies'])(_packageConfig)),
    skipMissing: true,
    ..._config.default.depcheckConfig,
    ignorePatterns: ['*.spec.js', 'package.json']
  });
  processResult('Unused dependencies', result.dependencies);
  result = await (0, _depcheck.default)('.', {
    package: (_packageConfig2 = _packageConfig3.default, (0, _omit.default)(['dependencies'])(_packageConfig2)),
    skipMissing: true,
    ..._config.default.depcheckConfig,
    ignorePatterns: ['!*.spec.js']
  });
  processResult('Unused devDependencies', result.devDependencies);
};

exports.default = _default;
module.exports = exports.default;