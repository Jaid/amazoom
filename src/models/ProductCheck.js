import Sequelize from "sequelize"
import amazonGot from "lib/amazonGot"
import cheerio from "cheerio-util"
import parseCurrency from "parsecurrency"
import core from "src/core"
import asyncRetry from "async-retry"
import ProductFetch from "src/models/ProductFetch"

class ProductCheck extends Sequelize.Model {

  /**
   * @param {string} asin
   * @return {Promise<ProductCheck>
   */
  static async make(asin) {
    await asyncRetry(async bail => {
      const response = await ProductFetch.makeRequest(asin)
      const hasCaptcha = response.body.contains("captcha")
      if (hasCaptcha) {
        bail(new Error(""))
        return
      }
      debugger
    })
    const result = await amazonGot(`dp/${asin}`)
    const dom = cheerio.load(result.body, {
      normalizeWhitespace: true,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
      recognizeSelfClosing: true,
      recognizeCDATA: true,
    })
    const listPriceTr = dom.root().findTrByFirstTd("Unverb. Preisempf.:")
    debugger
    if (listPriceTr?.[0]) {
      const listPrice = parseCurrency(listPriceTr[0])
      if (listPrice.symbol !== "€") {
        core.logger.warn("Currency symbol for product %s is \"%s\"", asin, listPrice.symbol)
      }
      const cents = listPrice.value * 100
      debugger
    }
  }

}

export const schema = {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  listPrice: Sequelize.INTEGER,
  price: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}

export default ProductCheck