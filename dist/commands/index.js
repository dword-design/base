"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mapValues = _interopRequireDefault(require("@dword-design/functions/dist/map-values"));

var _config = _interopRequireDefault(require("../config"));

var _checkUnknownFiles = _interopRequireDefault(require("./check-unknown-files"));

var _commit = _interopRequireDefault(require("./commit"));

var _lint = _interopRequireDefault(require("./lint"));

var _prepare = _interopRequireDefault(require("./prepare"));

var _test = _interopRequireDefault(require("./test"));

var _testDocker = _interopRequireDefault(require("./test-docker"));

var _config$commands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  checkUnknownFiles: {
    handler: _checkUnknownFiles.default
  },
  commit: {
    handler: _commit.default,
    options: [{
      description: 'Allow empty commits',
      name: '--allow-empty'
    }]
  },
  lint: {
    handler: _lint.default
  },
  prepare: {
    handler: _prepare.default
  },
  ...(_config.default.testInContainer && {
    'test:raw': {
      arguments: '[pattern]',
      handler: _test.default,
      options: [{
        description: 'Only run tests matching this string or regexp',
        name: '-g, --grep <grep>'
      }, {
        description: 'Update snapshots',
        name: '-u, --update-snapshots'
      }]
    }
  }),
  test: {
    arguments: '[pattern]',
    handler: _config.default.testInContainer ? _testDocker.default : _test.default,
    options: [{
      description: 'Only run tests matching this string or regexp',
      name: '-g, --grep <grep>'
    }, {
      description: 'Update snapshots',
      name: '-u, --update-snapshots'
    }]
  },
  ...(_config$commands = _config.default.commands, (0, _mapValues.default)(command => typeof command === 'function' ? {
    handler: command
  } : command)(_config$commands))
};
exports.default = _default;
module.exports = exports.default;