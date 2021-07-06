"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = _interopRequireDefault(require("../../config"));

var _jobMatrix = _interopRequireDefault(require("./strategies/job-matrix"));

var _simple = _interopRequireDefault(require("./strategies/simple"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  jobs: (_config.default.useJobMatrix && !_config.default.testInContainer ? _jobMatrix.default : _simple.default)(_config.default),
  name: 'build',
  on: {
    pull_request: {},
    push: {
      branches: ['master']
    }
  }
};
exports.default = _default;
module.exports = exports.default;