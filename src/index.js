import getCommands from './get-commands'

export const babelConfigFilename = '@dword-design/babel-config'
export const eslintConfigFilename = '@dword-design/eslint-config'
export const base = async (commandName, options) => getCommands(options)[commandName]()

