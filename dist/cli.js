#!/usr/bin/env node
"use strict";

var _mapValues = _interopRequireDefault(require("@dword-design/functions/dist/map-values"));

var _values = _interopRequireDefault(require("@dword-design/functions/dist/values"));

var _makeCli = _interopRequireDefault(require("make-cli"));

var _commands2 = _interopRequireDefault(require("./commands"));

var _ref, _commands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _makeCli.default)({
  commands: (_ref = (_commands = _commands2.default, (0, _mapValues.default)((command, name) => ({ ...command,
    handler: async (...args) => {
      try {
        var _command$handler;

        return _command$handler = command.handler(...args), await _command$handler;
      } catch (error) {
        console.log(error.message);
        process.exit(1);
        return undefined;
      }
    },
    name
  }))(_commands)), (0, _values.default)(_ref))
});