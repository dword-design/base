"use strict";

var _register = _interopRequireDefault(require("@babel/register"));

var _babelConfig = _interopRequireDefault(require("@dword-design/babel-config"));

var _expect = _interopRequireDefault(require("expect"));

var _expectMochaImageSnapshot = require("expect-mocha-image-snapshot");

var _expectMochaSnapshot = _interopRequireDefault(require("expect-mocha-snapshot"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect.default.extend({
  toMatchSnapshot: _expectMochaSnapshot.default
});

_expect.default.extend({
  toMatchImageSnapshot: _expectMochaImageSnapshot.toMatchImageSnapshot
}); // babel by default ignores everything outside the cwd and/or package.json folder. "ignore" resets this restriction
// https://github.com/babel/babel/issues/8321


(0, _register.default)({ ..._babelConfig.default,
  ignore: [/(\/|\\)node_modules(\/|\\)/, /(\/|\\)\.nuxt(\/|\\)/]
});
global.expect = _expect.default;