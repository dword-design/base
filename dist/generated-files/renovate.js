"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = _interopRequireDefault(require("../config"));

var _packageConfig = _interopRequireDefault(require("../package-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = { ...(_packageConfig.default.name !== '@dword-design/base' && {
    ignorePaths: ['.github/workflows/build.yml']
  }),
  extends: [':semanticCommits'],
  labels: ['maintenance'],
  lockFileMaintenance: {
    enabled: true
  },
  packageRules: [{
    matchPaths: ['package.json', ...(_config.default.isLockFileFixCommitType ? ['yarn.lock'] : [])],
    semanticCommitType: 'fix'
  }],
  semanticCommitScope: null
};
exports.default = _default;
module.exports = exports.default;