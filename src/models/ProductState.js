import Sequelize from "sequelize"
import ProductCheck from "src/models/ProductCheck"
import pRetry from "p-retry"
import ms from "ms.macro"
import ProductFetch from "src/models/ProductFetch"
import {got, logger} from "src/core"
import hasContent from "has-content"
import zahl from "zahl"

class ProductState extends Sequelize.Model {

  static watchedFields = [
    "price",
    "title",
    "currency",
  ]

  static associate(models) {
    ProductState.belongsTo(models.Product, {
      foreignKey: {
        allowNull: false,
      },
    })
    ProductState.hasMany(models.ProductCheck, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  /**
   * @param {string} platform
   * @param {string} platformIdentifier
   * @param {import("sequelize").FindOptions} sequelizeOptions
   * @return {Promise<ProductState>}
   */
  static async findByIdentifier(platform, platformIdentifier, sequelizeOptions) {
    return ProductState.findOne({
      where: {
        platform,
        platformIdentifier,
      },
      ...sequelizeOptions,
    })
  }

  /**
   * @param {string} platform
   * @param {number} productId
   * @param {import("sequelize").FindOptions} sequelizeOptions
   * @return {Promise<ProductState>}
   */
  static async findByProductId(platform, productId, sequelizeOptions) {
    return ProductState.findOne({
      where: {
        platform,
        ProductId: productId,
      },
      ...sequelizeOptions,
    })
  }

  getPlatform() {
    return require(`../platforms/${this.platform}/index.js`).default
  }

  /**
   * @return {Promise<string[]>}
   */
  async check() {
    const checkStartTime = Date.now()
    /**
     * @type {import("../platforms/Platform").default}
     */
    const platform = this.getPlatform()
    const url = platform.getUrl(this)
    const productCheck = ProductCheck.build({
      url,
      ProductStateId: this.id,
    })
    const createdProductFetches = []
    const collectedData = await pRetry(async () => {
      const fetchStartTime = Date.now()
      const gotInstance = platform.makeGot(got, this).extend({
        throwHttpErrors: false,
      })
      const response = await gotInstance(url)
      const productFetch = {
        url: response.requestUrl,
        requestHeaders: response.request.gotOptions.headers,
        responseHeaders: response.headers,
        body: response.body,
        httpVersion: response.httpVersion,
        method: response.request.gotOptions.method,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
        time: Date.now() - fetchStartTime,
      }
      createdProductFetches.push(productFetch)
      if (response.statusCode !== 200) {
        throw new Error("Status code is %s %s", response.statusCode, response.statusMessage)
      }
      const data = platform.checkState(productFetch, this)
      return data
    }, {
      retries: 5,
      maxTimeout: ms`1 minute`,
    })
    productCheck.time = Date.now() - checkStartTime
    productCheck.data = collectedData
    await productCheck.save()
    await ProductFetch.bulkCreate(createdProductFetches.map(fetch => ({
      ...fetch,
      ProductCheckId: productCheck.id,
    })), {
      logging: false,
    })
    if (!hasContent(collectedData)) {
      throw new Error("Failed fetching data for %s", this.getName())
    }
    const changedFields = []
    for (const key of ProductState.watchedFields) {
      if (this[key] !== collectedData[key]) {
        this.set(key, collectedData[key])
        changedFields.push(key)
      }
    }
    if (changedFields |> hasContent) {
      logger.info("%s received %s: %s", this.getName(), zahl(changedFields, "field update"), changedFields.join(", "))
      await this.save()
      productCheck.changes = changedFields.length
      await productCheck.save()
    }
    return changedFields
  }

  getName() {
    return `${this.platform}/${this.platformIdentifier}`
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  platformIdentifier: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  platform: {
    type: Sequelize.STRING(32),
    allowNull: false,
    defaultValue: "amazon",
  },
  title: Sequelize.STRING,
  price: Sequelize.INTEGER,
  currency: Sequelize.STRING,
}

/**
 * @type {import("sequelize").ModelIndexesOptions[]}
 */
export const indexes = [
  {
    fields: ["platform", "platformIdentifier"],
  },
]

export default ProductState