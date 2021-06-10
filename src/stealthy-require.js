import stealthyRequire from 'stealthy-require'

delete require.cache[require.resolve(__filename)]

export default (...args) => {
  const previousChildren = module.parent.children.slice()

  const result = stealthyRequire(...args)
  module.parent.children = previousChildren

  return result
}
