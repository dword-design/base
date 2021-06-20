"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _package = _interopRequireDefault(require("@commitlint/cli/package.json"));

var _first = _interopRequireDefault(require("@dword-design/functions/dist/first"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _execa = _interopRequireDefault(require("execa"));

var _fsExtra = require("fs-extra");

var _outputFiles = _interopRequireDefault(require("output-files"));

var _config = _interopRequireDefault(require("../config"));

var _generatedFiles = _interopRequireDefault(require("../generated-files"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = async () => {
  await (0, _outputFiles.default)(_generatedFiles.default);

  if (await (0, _fsExtra.exists)('.git')) {
    var _ref, _commitlintPackageCon;

    await _execa.default.command('husky install');
    await (0, _execa.default)('husky', ['set', '.husky/commit-msg', `npx ${(_ref = (_commitlintPackageCon = _package.default.bin, (0, _keys.default)(_commitlintPackageCon)), (0, _first.default)(_ref))} --edit "$1"`]);
  }

  return _config.default.prepare();
};

exports.default = _default;
module.exports = exports.default;