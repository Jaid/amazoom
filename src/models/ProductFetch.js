import Sequelize from "sequelize"
import got from "got"
import pRetry from "p-retry"

const amazonGot = got.extend({
  baseUrl: "https://amazon.de",
})

class ProductFetch extends Sequelize.Model {

  static async request(asin) {
    await response = 
  }

  static async get(asin) {
    const productFetches = []
    const request = () => async () => {
      await amazonGot(`dp/${asin}`, {

      })
    }
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