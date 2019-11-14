export default node => node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && node.callee.object.name === 'resolveBin'
  && node.callee.property.name === 'sync'
  && node.arguments[0] !== undefined && node.arguments[0].type === 'StringLiteral'
  ? [node.arguments[0].value]
  : []
