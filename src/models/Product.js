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
    Product.hasMany(models.ProductFetch, {
      foreignKey: {
        allowNull: false,
      },
    }),
    Product.hasMany(models.ProductState, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  /**
   * @param {string} asin
   * @param {import("sequelize").FindOptions} sequelizeOptions
   * @return {Promise<Product>}
   */
  static async findByAsin(asin, sequelizeOptions) {
    return Product.findOne({
      where: {asin},
      ...sequelizeOptions,
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

/**
 * @type {import("sequelize").ModelAttributes}
 */
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