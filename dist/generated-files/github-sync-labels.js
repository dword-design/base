"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [{
        uses: 'actions/checkout@v2'
      }, {
        env: {
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
        },
        uses: 'micnncim/action-label-syncer@v1'
      }]
    }
  },
  name: 'sync-labels',
  on: {
    push: {
      branches: ['master'],
      paths: ['.github/labels.yml', '.github/workflows/sync-labels.yml']
    }
  }
};
exports.default = _default;
module.exports = exports.default;