import additionalCommands from './additional-commands'
import prepare from './prepare'

export default {
  prepare: {
    handler: prepare,
  },
  ...additionalCommands,
}
