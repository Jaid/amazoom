import {got, config, logger} from "src/core"

const asin = "B07MLJD32L"

export default class Test {

  preInit() {
    return process.env.VSCODE_CLI === "1"
  }

  async init() {
    this.got = got.extend({
      baseUrl: "http://localhost",
      port: config.insecurePort,
    })
  }

  async ready() {
    await this.got.post("registerAsin", {
      query: {
        asin,
        title: "2TB NVMe m.2 Festplatte",
      },
    })
    const {body: info} = await this.got(`info/identifier/amazon/${asin}`, {
      json: true,
    })
    await this.got.post(`triggerCheck/product/${info.id}`)
    const {body: infoAfterCheck} = await this.got(`info/identifier/amazon/${asin}`, {
      json: true,
    })
    logger.info("Price: %s %s", Number(infoAfterCheck.price) / 100, infoAfterCheck.currency)
  }

}