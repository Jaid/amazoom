import Sequelize from "sequelize"
import ProductCheck from "src/models/ProductCheck"
import {logger} from "src/core"

class Product extends Sequelize.Model {

  static associate(models) {
    Product.hasMany(models.ProductCheck, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  static async findByAsin(asin, options) {
    return Product.findOne({
      where: {asin},
      ...options,
    })
  }

  /**
   * @param {import("sequelize").FindOptions} options
   * @return {Promise<ProductCheck>}
   */
  async getLatestCheck(options) {
    return ProductCheck.findOne({
      where: {
        ProductId: this.id,
      },
      ...options,
    })
  }

  async check() {
    const check = await ProductCheck.make(this)
  }

}

export const schema = {
  asin: {
    type: Sequelize.STRING(10), // See https://www.nchannel.com/blog/amazon-asin-what-is-an-asin-number
    allowNull: false,
    unique: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}

export default Product