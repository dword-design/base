"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _cancelExisting = _interopRequireDefault(require("../steps/cancel-existing"));

var _checkUnknownFiles = _interopRequireDefault(require("../steps/check-unknown-files"));

var _coverage = _interopRequireDefault(require("../steps/coverage"));

var _release = _interopRequireDefault(require("../steps/release"));

var _test = _interopRequireDefault(require("../steps/test"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = () => {
  var _coverageSteps;

  return {
    'cancel-existing': {
      if: "!contains(github.event.head_commit.message, '[skip ci]')",
      'runs-on': 'ubuntu-latest',
      steps: _cancelExisting.default
    },
    release: {
      needs: 'test',
      'runs-on': 'ubuntu-latest',
      steps: [{
        uses: 'actions/checkout@v2',
        with: {
          lfs: true,
          ref: "${{ github.event.pull_request.head.repo.full_name == github.repository && github.event.pull_request.head.ref || '' }}"
        }
      }, {
        uses: 'actions/setup-node@v2',
        with: {
          'node-version': 14
        }
      }, {
        run: 'git config --global user.email "actions@github.com"'
      }, {
        run: 'git config --global user.name "GitHub Actions"'
      }, {
        run: 'yarn --frozen-lockfile'
      }, ..._checkUnknownFiles.default, {
        run: 'yarn lint'
      }, ..._release.default]
    },
    test: {
      needs: 'cancel-existing',
      'runs-on': '${{ matrix.os }}',
      steps: [{
        uses: 'actions/checkout@v2',
        with: {
          'fetch-depth': 0,
          lfs: true
        }
      }, {
        uses: 'actions/setup-node@v2',
        with: {
          'node-version': '${{ matrix.node }}'
        }
      }, {
        run: 'yarn --frozen-lockfile'
      }, ..._test.default, ...(_coverageSteps = _coverage.default, (0, _map.default)(step => ({
        if: "matrix.os == 'ubuntu-latest' && matrix.node == 14",
        ...step
      }))(_coverageSteps))],
      strategy: {
        matrix: {
          exclude: [{
            node: 12,
            os: 'macos-latest'
          }, {
            node: 12,
            os: 'windows-latest'
          }],
          node: [12, 14],
          os: ['macos-latest', 'windows-latest', 'ubuntu-latest']
        }
      }
    }
  };
};

exports.default = _default;
module.exports = exports.default;