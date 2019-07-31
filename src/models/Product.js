import Sequelize from "sequelize"
import parseCurrency from "parsecurrency"
import cheerioEnhanced from "cheerio-util"
import amazonGot from "lib/amazonGot"

class Product extends Sequelize.Model {

  /**
   * @param {string} asin
   * @return {Promise<Product>
   */
  static async getProductHtml(asin) {

  }

  /**
   * @param {string} asin
   * @return {Promise<Product>
   */
  static async add(asin) {
    const result = await amazonGot(`dp/${asin}`)
    const dom = cheerioEnhanced.load(result.body, {
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
      debugger
    }
  }

}

export const schema = {
  asin: Sequelize.STRING(10), // See https://www.nchannel.com/blog/amazon-asin-what-is-an-asin-number
  title: Sequelize.STRING,
}

export default Product