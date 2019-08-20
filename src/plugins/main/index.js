import ProductState from "src/models/ProductState"
import intervalPromise from "interval-promise"
import ms from "ms.macro"

export default class Main {

  async ready() {
    intervalPromise(this.job, ms`1 minute`)
  }

  async job() {
    const productStates = await ProductState.findAll()
    for (const productState of productStates) {
      await productState.check()
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