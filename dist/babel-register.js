"use strict";

var _register = _interopRequireDefault(require("@babel/register"));

var _babelConfig = _interopRequireDefault(require("@dword-design/babel-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// babel by default ignores everything outside the cwd and/or package.json folder. "ignore" resets this restriction
// https://github.com/babel/babel/issues/8321
(0, _register.default)({ ..._babelConfig.default,
  ignore: [/(\/|\\)node_modules(\/|\\)/, /(\/|\\)\.nuxt(\/|\\)/]
});