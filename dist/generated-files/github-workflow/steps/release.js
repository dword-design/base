"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _package = _interopRequireDefault(require("@dword-design/ci/package.json"));

var _first = _interopRequireDefault(require("@dword-design/functions/dist/first"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _config = _interopRequireDefault(require("../../../config"));

var _ref, _ci$bin, _ref2;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bin = (_ref = (_ci$bin = _package.default.bin, (0, _keys.default)(_ci$bin)), (0, _first.default)(_ref));
var _default = [{
  env: {
    GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
    GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
  },
  name: 'Push changed files',
  run: `yarn ${bin} push-changed-files`
}, ...(_ref2 = [..._config.default.preDeploySteps, {
  env: {
    GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
    ...(_config.default.npmPublish ? {
      NPM_TOKEN: '${{ secrets.NPM_TOKEN }}'
    } : {}),
    ..._config.default.deployEnv
  },
  name: 'Release',
  run: 'yarn semantic-release'
}], (0, _map.default)(step => ({
  if: "github.ref == 'refs/heads/master'",
  ...step
}))(_ref2))];
exports.default = _default;
module.exports = exports.default;