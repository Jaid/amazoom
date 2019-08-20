import {got} from "src/core"
import Product from "src/models/Product"

export default class Test {

  preInit() {
    return process.env.VSCODE_CLI === "1"
  }

  async ready() {
    await got.post("http://localhost:17561/registerAsin", {
      query: {
        asin: "B07MLJD32L",
        title: "2TB NVMe m.2 Festplatte",
      },
    })
    const products = await Product.findAll()
    for (const product of products) {
      await product.check()
    }

    await got.get("http://localhost:17561/product/1/amazon/preview")
  }

}