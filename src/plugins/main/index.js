import Product from "src/models/Product"
import {logger} from "src/core"
import intervalPromise from "interval-promise"
import ms from "ms.macro"

export default class Main {

  async ready() {
    // const [product] = await Product.findOrCreate({
    //   where: {
    //     asin: "B071KGS72Q",
    //   },
    //   defaults: {
    //     title: "SanDisk Ultra 2D SSD 2 TB",
    //   },
    // })
    // await product.check()
    intervalPromise(this.job, ms`10 seconds`)
  }

  async job() {
    const products = await Product.findAll()
    for (const product of products) {
      await product.check()
    }
  }

  collectModels() {
    const models = {}
    const modelsRequire = require.context("../../models/", true, /.js$/)
    for (const value of modelsRequire.keys()) {
      const modelName = value.match(/\.\/(?<key>[\da-z]+)\./i).groups.key
      models[modelName] = modelsRequire(value)
    }
    return models
  }

}