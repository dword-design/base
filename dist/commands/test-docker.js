"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _filter = _interopRequireDefault(require("@dword-design/functions/dist/filter"));

var _flatMap = _interopRequireDefault(require("@dword-design/functions/dist/flat-map"));

var _join = _interopRequireDefault(require("@dword-design/functions/dist/join"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _replace = _interopRequireDefault(require("@dword-design/functions/dist/replace"));

var _constantCase = require("constant-case");

var _execa = _interopRequireDefault(require("execa"));

var _findUp = _interopRequireDefault(require("find-up"));

var _os = _interopRequireDefault(require("os"));

var _packageConfig = _interopRequireDefault(require("../package-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (pattern, options) => {
  var _ref, _packageConfig$name, _ref2, _ref3, _ref4, _envVariableNames, _ref5;

  options = {
    log: true,
    ...options
  };
  const volumeName = (_ref = (_packageConfig$name = _packageConfig.default.name, (0, _replace.default)('@', '')(_packageConfig$name)), (0, _replace.default)('/', '-')(_ref));

  const envSchemaPath = _findUp.default.sync('.env.schema.json');

  const envVariableNames = (_ref2 = (_ref3 = envSchemaPath ? require(envSchemaPath) : {}, (0, _keys.default)(_ref3)), (0, _map.default)(name => {
    var _name;

    return `TEST_${(_name = name, (0, _constantCase.constantCase)(_name))}`;
  })(_ref2));

  const userInfo = _os.default.userInfo();

  return (0, _execa.default)('docker', ['run', '--rm', '--tty', ...(_ref4 = (_envVariableNames = envVariableNames, (0, _filter.default)(name => process.env[name] !== undefined)(_envVariableNames)), (0, _flatMap.default)(name => ['--env', `${name}=${process.env[name]}`])(_ref4)), '-v', `${process.cwd()}:/app`, '-v', `${volumeName}:/app/node_modules`, 'dworddesign/testing:latest', 'bash', '-c', (_ref5 = ['yarn --frozen-lockfile', '&&', 'yarn test:raw', ...(options.updateSnapshots ? [' --update-snapshots'] : []), ...(pattern ? [`"${pattern}"`] : []), ...(options.grep ? [`-g "${options.grep}"`] : []), '&&', `chown -R ${userInfo.uid}:${userInfo.gid}`, '/app'], (0, _join.default)(' ')(_ref5))], options.log ? {
    stdio: 'inherit'
  } : {
    all: true
  });
};

exports.default = _default;
module.exports = exports.default;