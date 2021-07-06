"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = [{
  uses: 'codecov/codecov-action@v1',
  with: {
    fail_ci_if_error: true,
    token: '${{ secrets.CODECOV_TOKEN }}'
  }
}];
exports.default = _default;
module.exports = exports.default;