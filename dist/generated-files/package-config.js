"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mapValues = _interopRequireDefault(require("@dword-design/functions/dist/map-values"));

var _pick = _interopRequireDefault(require("@dword-design/functions/dist/pick"));

var _stubTrue = _interopRequireDefault(require("@dword-design/functions/dist/stub-true"));

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

var _fsExtra = require("fs-extra");

var _sortKeys = _interopRequireDefault(require("sort-keys"));

var _config = _interopRequireDefault(require("../config"));

var _packageConfig2 = _interopRequireDefault(require("../package-config"));

var _gitInfo = _interopRequireDefault(require("./git-info"));

var _config$commands, _packageConfig, _ref, _commandNames;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const commandNames = {
  checkUnknownFiles: true,
  commit: true,
  lint: true,
  prepare: true,
  ...(_config.default.testInContainer && {
    'test:raw': true
  }),
  test: true,
  ...(_config$commands = _config.default.commands, (0, _mapValues.default)(_stubTrue.default)(_config$commands))
};
var _default = { ...(_packageConfig = _packageConfig2.default, (0, _pick.default)(['name', 'private', 'deploy', 'description', 'baseConfig', 'bin', 'keywords', 'dependencies', 'devDependencies', 'peerDependencies', 'publishConfig', 'types'])(_packageConfig)),
  funding: 'https://github.com/sponsors/dword-design',
  publishConfig: {
    access: 'public'
  },
  version: _packageConfig2.default.version || '1.0.0',
  ...(_gitInfo.default && {
    repository: `dword-design/${_gitInfo.default.project}`
  }),
  author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
  engines: {
    node: '>=12'
  },
  files: ['dist', ...((0, _fsExtra.existsSync)('types.d.ts') ? ['types.d.ts'] : [])],
  license: 'MIT',
  ..._config.default.packageConfig,
  scripts: (_ref = (_commandNames = commandNames, (0, _mapValues.default)((nothing, name) => _packageConfig2.default.name === '@dword-design/base' ? `rimraf dist && babel --config-file ${(0, _depcheckPackageName.default)`@dword-design/babel-config`} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}` : `base ${name}`)(_commandNames)), (0, _sortKeys.default)(_ref))
};
exports.default = _default;
module.exports = exports.default;