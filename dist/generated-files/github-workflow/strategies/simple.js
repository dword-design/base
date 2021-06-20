"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cancelExisting = _interopRequireDefault(require("../steps/cancel-existing"));

var _checkUnknownFiles = _interopRequireDefault(require("../steps/check-unknown-files"));

var _coverage = _interopRequireDefault(require("../steps/coverage"));

var _release = _interopRequireDefault(require("../steps/release"));

var _test = _interopRequireDefault(require("../steps/test"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = config => ({
  build: {
    if: "!contains(github.event.head_commit.message, '[skip ci]')",
    'runs-on': 'ubuntu-latest',
    steps: [..._cancelExisting.default, {
      uses: 'actions/checkout@v2',
      with: {
        'fetch-depth': 0,
        lfs: true,
        ref: "${{ github.event.pull_request.head.repo.full_name == github.repository && github.event.pull_request.head.ref || '' }}"
      }
    }, {
      uses: 'actions/setup-node@v2',
      with: {
        'node-version': config.nodeVersion
      }
    }, {
      run: 'git config --global user.email "actions@github.com"'
    }, {
      run: 'git config --global user.name "GitHub Actions"'
    }, {
      run: 'yarn --frozen-lockfile'
    }, ..._test.default, ..._coverage.default, ..._checkUnknownFiles.default, ..._release.default]
  }
});

exports.default = _default;
module.exports = exports.default;