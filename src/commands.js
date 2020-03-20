import prepare from './prepare'
import additionalCommands from './additional-commands'

export default {
  prepare: {
    handler: prepare,
  },
  ...additionalCommands,
}
