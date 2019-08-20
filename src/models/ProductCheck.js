import Sequelize from "sequelize"
import cheerio from "cheerio-util"
import parseCurrency from "parsecurrency"
import {logger} from "src/core"
import ProductFetch from "src/models/ProductFetch"
import pRetry from "p-retry"
import ms from "ms.macro"
import hasContent from "has-content"
import json5 from "json5"
import Product from "src/models/ProductFetch"

class ProductCheck extends Sequelize.Model {

  static associate(models) {
    ProductCheck.belongsTo(models.Product, {
      foreignKey: {
        allowNull: false,
      },
    })
    ProductCheck.hasMany(models.ProductFetch)
  }

  /**
   * @param {string} asin
   * @param {import("sequelize").FindOptions} sequelizeOptions
   * @return {Promise<ProductCheck>}
   */
  static async getLatestByAsin(asin, sequelizeOptions) {
    const {id} = await Product.findOne({asin}, {
      attributes: ["id"],
      raw: true,
    })
    if (!id) {
      return
    }
    return ProductCheck.findOne({
      where: {
        ProductId: id,
      },
      order: [["createdAt", "DESC"]],
      ...sequelizeOptions,
    })
  }

  /**
   * @param {Product} product
   * @return {Promise<ProductCheck>
   */
  static async make(product) {
    try {
      const productFetchIds = []
      const productFetch = await pRetry(async () => {
        const fetch = await ProductFetch.make(product)
        productFetchIds.push(fetch.id)
        if (fetch.body.includes("api-services-support@amazon.com")) {
          logger.warn("Got captcha page")
          throw new Error("Has captcha")
        }
        return fetch
      }, {
        retries: 5,
        maxTimeout: ms`1 minute`,
      })
      /**
       * @type {import("cheerio")}
       */
      const dom = cheerio.load(productFetch.body, {
        normalizeWhitespace: true,
        lowerCaseTags: true,
        lowerCaseAttributeNames: true,
        recognizeSelfClosing: true,
        recognizeCDATA: true,
      })
      const listPriceTr = dom.root().findTrByFirstTd("Unverb. Preisempf.:")
      const productCheck = ProductCheck.build({
        ProductId: product.id,
      })
      if (listPriceTr?.[0]) {
        const listPriceText = listPriceTr[0]
        const listPrice = parseCurrency(listPriceText)
        if (listPrice) {
          if (listPrice.symbol !== "€") {
            logger.warn("Currency symbol for product #%s is \"%s\"", product.id, listPrice.symbol)
          }
          productCheck.listPrice = listPrice.value * 100
          productCheck.listPriceSymbol = listPrice.symbol
        } else {
          logger.warn("Could not parse \"%s\" with parsecurrency", listPriceText)
        }
      }
      const ourPriceNode = dom("#priceblock_ourprice")
      if (ourPriceNode) {
        const ourPriceText = ourPriceNode.textNormalized()
        const price = parseCurrency(ourPriceText)
        if (price) {
          if (price.symbol !== "€") {
            logger.warn("Currency symbol for product #%s is \"%s\"", product.id, price.symbol)
          }
          productCheck.price = price.value * 100
          productCheck.priceSymbol = price.symbol
        } else {
          logger.warn("Could not parse \"%s\" with parsecurrency", ourPriceText)
        }
      }
      const title = dom("#productTitle").textNormalized()
      if (title |> hasContent) {
        productCheck.title = title
      }
      const scripts = dom("script[type='text/javascript']").toArray().map(node => {
        return dom.text(node.childNodes).trim()
      }).filter(hasContent)
      const dataScript = scripts.find(script => /'twister-js-init-dpx-data'/s.test(script))
      if (dataScript) {
        const jsonString = /dataToReturn += +(?<object>{(.+)});/s.exec(dataScript).groups.object
        productCheck.dataObject = json5.parse(jsonString)
      }
      const imagesScript = scripts.find(script => /'ImageBlockATF'.+jQuery\.parseJSON/s.test(script))
      if (imagesScript) {
        const jsonString = /parseJSON\('(?<json>.*?)'\);/s.exec(imagesScript).groups.json
        productCheck.imagesObject = JSON.parse(jsonString)
      }
      await productCheck.save()
      await ProductFetch.update({
        ProductCheckId: productCheck.id,
      }, {
        where: {
          id: productFetchIds,
        },
      })
      return productCheck
    } catch (error) {
      logger.error("Could not make product check for #%s: %s", product.id, error)
    }
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  /* price: Sequelize.INTEGER,
  priceSymbol: Sequelize.STRING,
  imagesObject: Sequelize.JSONB,
  dataObject: Sequelize.JSONB, */
}

export default ProductCheck