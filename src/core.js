import JaidCore from "jaid-core"

const core = new JaidCore({
  name: _PKG_TITLE,
  version: _PKG_VERSION,
  insecurePort: 13333,
  database: "amazoom",
  gotLogLevel: "info",
  useGot: true,
})

export const logger = core.logger
export const got = core.got

export default core