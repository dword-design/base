"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fromPairs = _interopRequireDefault(require("@dword-design/functions/dist/from-pairs"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _constantCase = require("constant-case");

var _findUp = _interopRequireDefault(require("find-up"));

var _ref, _ref2, _ref3, _envVariableNames;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const envSchemaPath = _findUp.default.sync('.env.schema.json');

const envVariableNames = (_ref = (_ref2 = envSchemaPath ? require(envSchemaPath) : {}, (0, _keys.default)(_ref2)), (0, _map.default)(name => {
  var _name;

  return `TEST_${(_name = name, (0, _constantCase.constantCase)(_name))}`;
})(_ref));
var _default = [{
  run: 'yarn test',
  ...(envVariableNames.length > 0 ? {
    env: (_ref3 = (_envVariableNames = envVariableNames, (0, _map.default)(name => [name, `\${{ secrets.${name} }}`])(_envVariableNames)), (0, _fromPairs.default)(_ref3))
  } : {})
}, {
  if: 'failure()',
  uses: 'actions/upload-artifact@v2',
  with: {
    name: 'Image Snapshot Diffs',
    path: '**/__image_snapshots__/__diff_output__'
  }
}];
exports.default = _default;
module.exports = exports.default;