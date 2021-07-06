"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [{
        uses: 'actions/checkout@v2'
      }, {
        uses: 'jaid/action-sync-node-meta@v2.0.0',
        with: {
          approve: false,
          ...(!_config.default.syncKeywords && {
            syncKeywords: false
          }),
          commitMessage: 'fix: write GitHub metadata to package.json [{changes}]',
          githubToken: '${{ secrets.GITHUB_TOKEN }}'
        }
      }]
    }
  },
  name: 'sync-metadata',
  on: {
    schedule: [{
      cron: '0 5 * * *'
    }],
    workflow_dispatch: {}
  }
};
exports.default = _default;
module.exports = exports.default;