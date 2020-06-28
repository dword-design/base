import commonAllowedMatches from './common-allowed-matches.json'
import config from './config'

export default [...commonAllowedMatches, ...(config.allowedMatches || [])]
