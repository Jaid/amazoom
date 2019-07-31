import Sequelize from "sequelize"
import parseCurrency from "parsecurrency"
import cheerioEnhanced from "cheerio-util"
import amazonGot from "lib/amazonGot"
import core from "src/core"

class Product extends Sequelize.Model {

  /**
   * @param {string} asin
   * @return {Promise<Product>
   */
  static async getProductHtml(asin) {

  }


  static async start() {
    await Product.add("B071KGS72Q")
  }

}

export const schema = {
  asin: Sequelize.STRING(10), // See https://www.nchannel.com/blog/amazon-asin-what-is-an-asin-number
  title: Sequelize.STRING,
}

export default Product