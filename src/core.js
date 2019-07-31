import JaidCore from "jaid-core"

export default new JaidCore({
  name: _PKG_TITLE,
  version: _PKG_VERSION,
  insecurePort: 13333,
  database: "amazoom",
})