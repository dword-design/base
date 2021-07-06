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
  extends: [':semanticCommits', ':semanticPrefixFix'],
  labels: ['maintenance'],
  lockFileMaintenance: {
    enabled: true,
    ...(_config.default.isLockFileFixCommitType ? {} : {
      semanticCommitType: 'chore'
    })
  },
  semanticCommitScope: null
};
exports.default = _default;
module.exports = exports.default;