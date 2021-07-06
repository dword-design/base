"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  plugins: ['@semantic-release/commit-analyzer', '@semantic-release/release-notes-generator', (0, _depcheckPackageName.default)`@semantic-release/changelog`, _config.default.npmPublish ? (0, _depcheckPackageName.default)`@semantic-release/npm` : [(0, _depcheckPackageName.default)`@semantic-release/npm`, {
    npmPublish: false
  }], ..._config.default.deployPlugins, _config.default.deployAssets.length ? [(0, _depcheckPackageName.default)`@semantic-release/github`, {
    assets: _config.default.deployAssets
  }] : (0, _depcheckPackageName.default)`@semantic-release/github`, [(0, _depcheckPackageName.default)`@semantic-release/git`, {
    message: 'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
  }]]
};
exports.default = _default;
module.exports = exports.default;