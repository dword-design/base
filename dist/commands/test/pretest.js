"use strict";

require("../../babel-register");

var _expect = _interopRequireDefault(require("expect"));

var _expectMochaImageSnapshot = require("expect-mocha-image-snapshot");

var _expectMochaSnapshot = _interopRequireDefault(require("expect-mocha-snapshot"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect.default.extend({
  toMatchSnapshot: _expectMochaSnapshot.default
});

_expect.default.extend({
  toMatchImageSnapshot: _expectMochaImageSnapshot.toMatchImageSnapshot
});

global.expect = _expect.default;