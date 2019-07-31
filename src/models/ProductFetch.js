import Sequelize from "sequelize"
import got from "got"
import pRetry from "p-retry"

const amazonGot = got.extend({
  baseUrl: "https://amazon.de",
})

class ProductFetch extends Sequelize.Model {

  /**
   * @param {string} asin
   * @return {Promise<import("got").Response>}
   */
  static async makeRequest(asin) {
    return amazonGot(`dp/${asin}`)
  }

}

export const schema = {
  url: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  userAgent: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  try: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}

export default ProductFetch