"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = [{
  env: {
    GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
  },
  uses: 'rokroskar/workflow-run-cleanup-action@v0.3.3'
}];
exports.default = _default;
module.exports = exports.default;