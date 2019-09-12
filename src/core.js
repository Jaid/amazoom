import JaidCore from "jaid-core"

import defaults from "./defaults.yml"

const core = new JaidCore({
  name: _PKG_TITLE,
  version: _PKG_VERSION,
  insecurePort: 17561,
  database: "amazoom",
  useGot: true,
  databaseExtensions: "hstore",
  configSetup: {
    defaults,
    secretKeys: [
      "twitchClientId",
      "twitchClientSecret",
    ],
  },
})

/**
 * @typedef {Object} Config
 * @prop {string} frontendHost
 * @prop {string} loginRedirectUrl
 */

/**
 * @type {import("jaid-logger").JaidLogger}
 */
export const logger = core.logger

/**
 * @type {import("got").GotInstance}
 */
export const got = core.got

/**
 * @type {import("jaid-core").BaseConfig & Config}
 */
export const config = core.config

/**
 * @type {string}
 */
export const appFolder = core.appFolder

/**
 * @type {import("koa")}
 */
export const koa = core.koa

export default core