"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _execa = _interopRequireDefault(require("execa"));

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = async options => {
  options = {
    resolvePluginsRelativeTo: require.resolve('@dword-design/eslint-config'),
    ...options
  };

  try {
    await (0, _execa.default)('eslint', ['--fix', '--ext', '.js,.json,.vue', '--ignore-path', '.gitignore', '--resolve-plugins-relative-to', options.resolvePluginsRelativeTo, '.'], {
      all: true
    });
  } catch (error) {
    throw new Error(error.all);
  }

  await _config.default.lint();
};

exports.default = _default;
module.exports = exports.default;