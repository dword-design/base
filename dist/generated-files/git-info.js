"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fsExtra = require("fs-extra");

var _hostedGitInfo = _interopRequireDefault(require("hosted-git-info"));

var _parseGitConfig = _interopRequireDefault(require("parse-git-config"));

var _parseGitConfig$sync$;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const gitUrl = (0, _fsExtra.existsSync)('.git') ? (_parseGitConfig$sync$ = _parseGitConfig.default.sync()['remote "origin"']) === null || _parseGitConfig$sync$ === void 0 ? void 0 : _parseGitConfig$sync$.url : undefined;
const gitInfo = _hostedGitInfo.default.fromUrl(gitUrl) || {};

if (gitUrl !== undefined && gitInfo.type !== 'github') {
  throw new Error('Only GitHub repositories are supported.');
}

var _default = gitUrl ? gitInfo : undefined;

exports.default = _default;
module.exports = exports.default;